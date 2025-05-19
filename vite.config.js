import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';


export default defineConfig({
    plugins: [vue()],
    outDir: 'previewDist',
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
});
