import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // FINAL CONFIGURAÇÃO PARA DEPLOY E CORREÇÃO DE ERROS
  base: './', // Fixa o erro de path de assets (Tela Branca/404)
  build: {
    target: 'esnext', // Fixa o erro de Top-level await
    chunkSizeWarningLimit: 1000, 
  },
})
