import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    publicDir: 'public',
    define: {
      'process.env': {
        NODE_ENV: mode,
        REACT_APP_BACKEND_URL:
          env.REACT_APP_BACKEND_URL || env.VITE_BACKEND_URL || '',
        REACT_APP_WS_URL: env.REACT_APP_WS_URL || env.VITE_WS_URL || '',
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    preview: {
      port: 3000,
      open: true,
    },
  };
});

