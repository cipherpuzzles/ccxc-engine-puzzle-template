<template>
    <v-stage :config="stageSize" @dragstart="handleDragstart" @dragend="handleDragend">
        <v-layer ref="layer">
            <v-star v-for="item in list" :key="item.id" :config="{
                x: item.x,
                y: item.y,
                rotation: item.rotation,
                id: item.id,
                numPoints: 5,
                innerRadius: 30,
                outerRadius: 50,
                fill: '#89b717',
                opacity: 0.8,
                draggable: true,
                scaleX: dragItemId === item.id ? item.scale * 1.2 : item.scale,
                scaleY: dragItemId === item.id ? item.scale * 1.2 : item.scale,
                shadowColor: 'black',
                shadowBlur: 10,
                shadowOffsetX: dragItemId === item.id ? 15 : 5,
                shadowOffsetY: dragItemId === item.id ? 15 : 5,
                shadowOpacity: 0.6
            }" />
        </v-layer>
    </v-stage>
</template>

<script>
import { ref, onMounted } from 'vue';
import VueKonva from 'vue-konva';

export default {
    setup() {
        const stageSize = {
            width: 1020,
            height: 480
        };

        const list = ref([]);
        const dragItemId = ref(null);

        const handleDragstart = (e) => {
            // save drag element:
            dragItemId.value = e.target.id();
            // move current element to the top:
            const item = list.value.find(i => i.id === dragItemId.value);
            const index = list.value.indexOf(item);
            list.value.splice(index, 1);
            list.value.push(item);
        };

        const handleDragend = () => {
            dragItemId.value = null;
        };

        onMounted(() => {
            for (let n = 0; n < 30; n++) {
                list.value.push({
                    id: Math.round(Math.random() * 10000).toString(),
                    x: Math.random() * stageSize.width,
                    y: Math.random() * stageSize.height,
                    rotation: Math.random() * 180,
                    scale: Math.random()
                });
            }
        });

        return {
            stageSize,
            list,
            dragItemId,
            handleDragend,
            handleDragstart
        }
    },
    ccxcPuzzleAppConfig: {
        onAppInit: (app) => {
            app.use(VueKonva);
        }
    }
}
</script>