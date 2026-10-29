import { useEffect } from 'react';

const targets = [
  '.hero-carousel',
  '.course-finder',
  '.section-heading',
  '.quick-links-card:not(.is-placeholder)',
  '.courses-section .course-card',
  '.services-grid .photo-card',
  '.institutional-carousel',
  '.news-grid .main-story:not(.is-placeholder)',
  '.news-grid .small-story:not(.is-placeholder)',
  '.notices-grid .photo-card',
  '.video-section .senac80-inner',
  '.contact-section',
  '.inner-page-heading',
  '.inner-section-title',
  '.inner-tile',
  '.inner-news-card',
  '.course-page-banner',
  '.inner-resources',
  '.service-photo-grid .photo-card',
].join(', ');

const cardGroups = '.quick-links-grid, .course-viewport, .services-grid, .secondary-stories, .notices-grid, .inner-tile-grid, .inner-news-grid, .service-photo-grid';

export default function SiteMotion() {
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main || !window.IntersectionObserver || !Element.prototype.animate) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet();
    const running = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (reducedMotion.matches) return;

        const group = target.parentElement?.closest(cardGroups);
        const siblings = group && target.parentElement === group ? [...group.children] : [];
        const delay = Math.min(Math.max(siblings.indexOf(target), 0), 4) * 55;
        const isHero = target.classList.contains('hero-carousel');
        const animation = target.animate(
          [{ opacity:isHero ? 0.72 : 0.6, transform:`translateY(${isHero ? 8 : 14}px)` },
            { opacity:1, transform:'translateY(0)' }],
          { duration:isHero ? 460 : 340, delay, easing:'cubic-bezier(.2, 0, 0, 1)', fill:'backwards' },
        );
        running.add(animation);
        animation.addEventListener('finish', () => running.delete(animation), { once:true });
      });
    }, { threshold:0.08, rootMargin:'0px 0px -32px 0px' });

    const observe = root => {
      const matches = root.matches?.(targets) ? [root] : [];
      root.querySelectorAll?.(targets).forEach(element => matches.push(element));
      matches.forEach(element => {
        if (seen.has(element) || element.closest('.mission-page, .administration-page')) return;
        seen.add(element);
        observer.observe(element);
      });
    };
    observe(main);

    const mutations = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) observe(node);
      }));
    });
    mutations.observe(main, { childList:true, subtree:true });

    const stopAnimations = () => {
      if (reducedMotion.matches) running.forEach(animation => animation.cancel());
    };
    reducedMotion.addEventListener('change', stopAnimations);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      reducedMotion.removeEventListener('change', stopAnimations);
      running.forEach(animation => animation.cancel());
    };
  }, []);

  return null;
}
