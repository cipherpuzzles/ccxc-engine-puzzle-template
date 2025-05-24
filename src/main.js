import { createApp } from 'vue'
import './previewComponents/message.js'
import App from './App.vue'
import puzzleVuePlugin from './previewComponents/puzzleVuePlugin.js'


// 一些外部库需要在app入口处加载时，为了可以正常预览，也要同时修改main.js
import VueKonva from 'vue-konva'



const app = createApp(App)
app.use(puzzleVuePlugin)
app.use(VueKonva)

app.mount('#app') 