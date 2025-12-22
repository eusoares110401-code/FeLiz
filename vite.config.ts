import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: true, // Libera acesso via IP de rede (útil para testar no celular)
    },
    define: {
      // Isso permite usar process.env.API_KEY no código do navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})