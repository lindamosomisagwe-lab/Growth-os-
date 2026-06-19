import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  const useMock = env.VITE_USE_MOCK_FIREBASE !== 'false';

  const alias = {};
  if (useMock) {
    alias['firebase/app'] = path.resolve(__dirname, 'src/mock-firebase.js');
    alias['firebase/auth'] = path.resolve(__dirname, 'src/mock-firebase.js');
    alias['firebase/firestore'] = path.resolve(__dirname, 'src/mock-firebase.js');
    alias['../firebase-config'] = path.resolve(__dirname, 'src/mock-firebase.js');
    alias['./firebase-config'] = path.resolve(__dirname, 'src/mock-firebase.js');
  }

  return {
    plugins: [react()],
    resolve: {
      alias
    }
  };
});
