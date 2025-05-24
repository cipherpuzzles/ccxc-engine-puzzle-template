import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import mkcert from 'vite-plugin-mkcert'


export default defineConfig({
    plugins: [
        mkcert({
            hosts: ["test.my.ikp.yt"],
            source: "coding"
        }),
        vue()
    ],
    outDir: 'previewDist',
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    server: {
        https: true
    }
});
