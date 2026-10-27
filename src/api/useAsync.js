import { useEffect, useState } from 'react';

// Executa uma função assíncrona e expõe { status: 'loading' | 'ready' | 'error', data, error }.
// Ignora respostas de execuções antigas (troca de dependências/desmontagem).
export default function useAsync(task, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  useEffect(() => {
    let active = true;
    setState(current => current.status === 'loading' ? current : { status: 'loading', data: current.data, error: null });
    task().then(
      data => { if (active) setState({ status: 'ready', data, error: null }); },
      error => { if (active) setState({ status: 'error', data: null, error }); },
    );
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
