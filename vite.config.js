import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        sass: 'sass.html', 
        animation: 'animation.html'
      }
    }
  }
})