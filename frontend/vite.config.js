import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{
    proxy:{// with this proxy baar baar http://localhost:8000 likhne ki zarurat nahi padegi, bas /api/endpoint likh dena hai
      "/api": "http://localhost:8000"
  }
}})
