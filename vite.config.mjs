import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A API pública fica sempre em /v1. Em desenvolvimento e no `vite preview` o Vite faz proxy para a API local,
// deixando o site e a API na mesma origem (sem CORS). Em produção, use um proxy reverso para /v1 (ou VITE_API_URL).
const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8080';
// Alvo remoto (https) precisa de changeOrigin para o proxy reverso casar o Host.
const proxy = { '/v1': { target: apiTarget, changeOrigin: apiTarget.startsWith('https:'), secure: true } };

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
});
