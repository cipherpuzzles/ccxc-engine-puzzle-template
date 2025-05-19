<template>
  <div class="example-puzzle">
    <h1>{{ title }}</h1>
    <p>这是一个示例谜题组件</p>
    <button class="button" @click="count++">点击次数: {{ count }}</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
    setup() {
        const title = ref('示例谜题');
        const count = ref(0);

        return {
            title,
            count
        }
    }
}


</script>


<style scoped>
.example-puzzle {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 500px;
  margin: 0 auto;
}

.button {
    background-color: #4CAF50; /* 绿色背景 */
    color: white; /* 白色文字 */
    padding: 10px 20px; /* 内边距 */
    border: none; /* 无边框 */
    border-radius: 5px; /* 圆角 */
    cursor: pointer; /* 鼠标悬停时显示为手形 */
    transition: background-color 0.3s ease; /* 平滑过渡 */
}

.button:hover {
    background-color: #45a049; /* 悬停时更深的绿色 */
}
</style> 