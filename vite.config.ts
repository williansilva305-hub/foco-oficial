import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ADICIONAR ESTE BLOCO PARA RESOLVER O ERRO DE TOP-LEVEL AWAIT
  build: {
    target: 'esnext',
  },
})
