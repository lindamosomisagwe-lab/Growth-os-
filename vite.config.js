import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'firebase/app': path.resolve(__dirname, 'src/mock-firebase.js'),
      'firebase/auth': path.resolve(__dirname, 'src/mock-firebase.js'),
      'firebase/firestore': path.resolve(__dirname, 'src/mock-firebase.js'),
      '../firebase-config': path.resolve(__dirname, 'src/mock-firebase.js'),
      './firebase-config': path.resolve(__dirname, 'src/mock-firebase.js')
    }
  }
});
