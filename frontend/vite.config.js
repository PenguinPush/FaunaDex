import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), mkcert(), tailwindcss()],
    server: {https: true},
    build: {
        outDir: 'dist',
    }
});
