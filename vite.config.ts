import { defineConfig } from 'vite';

// "./" makes the built pages work from any folder, including GitHub Pages.
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        game: 'index.html',
        editor: 'editor.html',
      },
    },
  },
});
