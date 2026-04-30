import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0) - required for ngrok
    port: 5173, // Default Vite port
    strictPort: false, // Allow port to be changed if 5173 is in use
    // Allow specific hosts (required for ngrok)
    allowedHosts: [
      'd8fd05d8e599.ngrok-free.app',
      '.ngrok-free.app', // Allow all ngrok-free.app subdomains
      '.ngrok.io', // Allow all ngrok.io subdomains
      'localhost',
    ],
    // CORS configuration - allows requests from ngrok domain
    cors: {
      origin: [
        'https://d8fd05d8e599.ngrok-free.app',
        'http://localhost:5173',
        /\.ngrok-free\.app$/,
        /\.ngrok\.io$/,
      ],
      credentials: true,
    },
    // Headers to help with ngrok
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
})
