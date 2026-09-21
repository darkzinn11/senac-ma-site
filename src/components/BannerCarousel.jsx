import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { asset } from '../data/content';
import { Icon } from './Ui';

export default function BannerCarousel({ slides, label, variant = 'hero', initial = 0 }) {
  const [index, setIndex] = useState(initial);
  const indexRef = useRef(initial);
  const stageRef = useRef(null);
  const pointer = useRef(null);
  const animating = useRef(false);
  const suppressClick = useRef(false);
  const pendingTarget = useRef(null);
  const transitionTimer = useRef(null);
  const changeRef = useRef(null);
  const previous = (index - 1 + slides.length) % slides.length;
  const next = (index + 1) % slides.length;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setCurrent = (value) => {
    indexRef.current = (value + slides.length) % slides.length;
    setIndex(indexRef.current);
  };
  const setOffset = (value) => stageRef.current?.style.setProperty('--slide-offset', value + 'px');
  const stepSize = () => stageRef.current.clientWidth + (window.innerWidth <= 767 ? 12 : 29);
  const activeDirection = useRef(0);
  function finish() {
    if (!animating.current) return;
    animating.current = false;
    clearTimeout(transitionTimer.current);
    const stage = stageRef.current;
    stage.classList.add('is-resetting');
    // Troca o trio de slides e restaura o deslocamento na MESMA frame.
    // Sem commit síncrono, a imagem antiga aparece por um instante (flash/lag).
    flushSync(() => setCurrent(indexRef.current + activeDirection.current));
    setOffset(0);
    stage.classList.remove('is-animating');
    requestAnimationFrame(() => {
      stage.classList.remove('is-resetting');
      const target = pendingTarget.current;
      if (target === null) return;
      if (target === indexRef.current) { pendingTarget.current = null; return; }
      requestAnimationFrame(() => changeRef.current?.(directionTo(target)));
    });
  }
  function directionTo(target) {
    const forward = (target - indexRef.current + slides.length) % slides.length;
    return forward <= slides.length / 2 ? 1 : -1;
  }
  function change(direction) {
    if (animating.current || slides.length < 2) return;
    if (reducedMotion()) { setOffset(0); setCurrent(indexRef.current + direction); return; }
    animating.current = true;
    activeDirection.current = direction;
    stageRef.current.classList.add('is-animating');
    setOffset(-direction * stepSize());
    transitionTimer.current = setTimeout(finish, 650);
  }
  changeRef.current = change;
  function navigateTo(target) {
    pendingTarget.current = target;
    if (animating.current) return;
    if (reducedMotion()) {
      pendingTarget.current = null;
      setCurrent(target);
      return;
    }
    if (target !== indexRef.current) change(directionTo(target));
    else pendingTarget.current = null;
  }
  function start(event) {
    if (event.button !== 0 || animating.current || slides.length < 2) return;
    pointer.current = { id:event.pointerId, x:event.clientX, y:event.clientY, dragging:false };
    suppressClick.current = false;
  }
  function move(event) {
    const p = pointer.current;
    if (!p || p.id !== event.pointerId || animating.current) return;
    const dx = event.clientX - p.x;
    const dy = event.clientY - p.y;
    if (!p.dragging && (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy))) return;
    if (!p.dragging) {
      p.dragging = true;
      stageRef.current.classList.add('is-dragging');
      stageRef.current.setPointerCapture(event.pointerId);
    }
    setOffset(Math.max(-stepSize(), Math.min(stepSize(), dx)));
  }
  function end(event) {
    const p = pointer.current;
    if (!p || p.id !== event.pointerId) return;
    pointer.current = null;
    if (!p.dragging) return;
    suppressClick.current = true;
    stageRef.current.classList.remove('is-dragging');
    const dx = event.clientX - p.x;
    if (Math.abs(dx) >= 45) change(dx < 0 ? 1 : -1);
    else setOffset(0);
    if (stageRef.current.hasPointerCapture(event.pointerId)) {
      stageRef.current.releasePointerCapture(event.pointerId);
    }
  }
  function cancel() {
    pointer.current = null;
    stageRef.current?.classList.remove('is-dragging');
    if (!animating.current) setOffset(0);
  }
  useEffect(() => {
    const stage = stageRef.current;
    let distance = 0;
    let lastTrigger = 0;
    const wheel = (event) => {
      const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
      if (!delta || (!event.shiftKey && Math.abs(delta) <= Math.abs(event.deltaY))) return;
      event.preventDefault();
      if (performance.now() - lastTrigger < 650 || animating.current) return;
      distance += delta;
      if (Math.abs(distance) < 50) return;
      lastTrigger = performance.now();
      changeRef.current?.(distance > 0 ? 1 : -1);
      distance = 0;
    };
    stage.addEventListener('wheel', wheel, { passive:false });
    return () => { stage.removeEventListener('wheel', wheel); clearTimeout(transitionTimer.current); };
  }, []);
  function contents(slide, side = false) {
    return <>
      <img src={asset(slide.image)} alt={side ? '' : slide.alt} draggable="false"
        loading="eager"
        fetchPriority={variant === 'hero' && !side ? 'high' : 'auto'} decoding="async" />
      {slide.title && <><div className="institutional-shade" />
        <div className="institutional-content">
          <img className="institutional-logo" src={asset('10346.svg')} alt="" width="85" height="50" />
          <h2>{slide.title}</h2><p>{slide.description}</p>
        </div></>}
    </>;
  }
  return <section className={'banner-carousel ' + variant + '-carousel'} aria-roledescription="carrossel" aria-label={label}>
    <div className="banner-stage" ref={stageRef} onPointerDown={start} onPointerMove={move}
      onPointerUp={end} onPointerCancel={cancel}>
      <div className="banner-track"
        onTransitionEnd={e => { if (e.target === e.currentTarget && e.propertyName === 'transform') finish(); }}>
        <div className="banner-slide side-slide far-previous-slide" aria-hidden="true">
          {contents(slides[(index - 2 + slides.length * 2) % slides.length], true)}
        </div>
        <div className="banner-slide side-slide previous-slide" aria-hidden="true">{contents(slides[previous], true)}</div>
        <a className="banner-slide main-slide" href={slides[index].href}
          onDragStart={e => e.preventDefault()}
          onClick={e => { if (suppressClick.current) { e.preventDefault(); suppressClick.current = false; } }}
          aria-label={slides[index].alt}>
          {contents(slides[index])}
        </a>
        <div className="banner-slide side-slide next-slide" aria-hidden="true">{contents(slides[next], true)}</div>
        <div className="banner-slide side-slide far-next-slide" aria-hidden="true">
          {contents(slides[(index + 2) % slides.length], true)}
        </div>
      </div>
      {variant === 'hero' && <div className="banner-dots" aria-label="Escolher banner">
        {slides.map((slide, i) => <button key={slide.image} onClick={() => navigateTo(i)}
          className={i === index ? 'is-active' : ''} aria-label={'Mostrar banner ' + (i + 1)}
          aria-current={i === index ? 'true' : undefined}><span /></button>)}
      </div>}
    </div>
    <button className="banner-arrow banner-previous" onClick={() => { pendingTarget.current = null; change(-1); }} aria-label={'Banner anterior — ' + label}>
      <Icon name="chevronLeft" />
    </button>
    <button className="banner-arrow banner-next" onClick={() => { pendingTarget.current = null; change(1); }} aria-label={'Próximo banner — ' + label}>
      <Icon name="chevronLeft" />
    </button>
    <span className="sr-only" aria-live="polite">Banner {index + 1} de {slides.length}</span>
  </section>;
}
