import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FINAL CONFIGURAÇÃO PARA DEPLOY E CORREÇÃO DE ERROS/AVISOS
  base: './', // Fixa o erro de path de assets (Tela Branca/404)
  build: {
    target: 'esnext', // Fixa o erro de Top-level await
    chunkSizeWarningLimit: 1000, // Aumenta o limite para remover o aviso de tamanho de arquivo
  },
})
