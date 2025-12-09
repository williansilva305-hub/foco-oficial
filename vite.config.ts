import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  // ADICIONAR ESTA LINHA FINAL PARA CORRIGIR O ERRO DE CAMINHO (404)
  base: './', 
})
