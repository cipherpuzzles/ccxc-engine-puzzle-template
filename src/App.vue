<template>
  <div class="app-container">
    <header class="app-header">
      <h1>CCXC Engine Puzzle 模板</h1>
      <div class="puzzle-selector">
        <label for="puzzle-select">选择谜题：</label>
        <select id="puzzle-select" v-model="selectedPuzzle" @change="loadPuzzle">
          <option v-for="puzzle in puzzles" :key="puzzle.name" :value="puzzle.name">
            {{ puzzle.name }}
          </option>
        </select>
      </div>
    </header>

    <main class="preview-container">
      <div class="preview-header">
        <h2>预览：{{ selectedPuzzle }}</h2>
        <div class="preview-tools">
          <button @click="reloadPuzzle" class="reload-btn">
            <span class="reload-icon">↻</span> 重新加载
          </button>
        </div>
      </div>
      
      <div class="preview-content">
        <component :is="currentPuzzleComponent" v-if="currentPuzzleComponent" />
        <div v-else class="empty-state">
          <p>请选择一个谜题组件进行预览</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
// 动态导入所有谜题
const puzzleModules = import.meta.glob('./puzzles/*.vue');

import { markRaw } from 'vue';

export default {
  name: 'App',
  data() {
    return {
      puzzles: [],
      selectedPuzzle: '',
      currentPuzzleComponent: null
    }
  },
  created() {
    // 遍历所有谜题模块，生成谜题列表
    this.puzzles = Object.keys(puzzleModules).map(modulePath => {
      const name = modulePath.split('/').pop().replace('.vue', '');
      return { name, path: modulePath };
    });
    
    // 如果有谜题，默认选择第一个
    if (this.puzzles.length > 0) {
      this.selectedPuzzle = this.puzzles[0].name;
      this.loadPuzzle();
    }
  },
  methods: {
    async loadPuzzle() {
      if (!this.selectedPuzzle) return;
      
      try {
        // 查找当前选择的谜题
        const puzzleInfo = this.puzzles.find(p => p.name === this.selectedPuzzle);
        if (!puzzleInfo) return;
        
        // 动态导入谜题组件，使用 markRaw 防止组件被转换为响应式对象
        const module = await puzzleModules[puzzleInfo.path]();
        this.currentPuzzleComponent = markRaw(module.default);
      } catch (error) {
        console.error('加载谜题失败:', error);
        this.currentPuzzleComponent = null;
      }
    },
    reloadPuzzle() {
      // 重新加载当前谜题
      this.currentPuzzleComponent = null;
      setTimeout(() => {
        this.loadPuzzle();
      }, 100);
    }
  }
}
</script>

<style>
/* 重置和基础样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

button {
  cursor: pointer;
}

/* 应用容器 */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 头部样式 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.app-header h1 {
  color: #2c3e50;
  font-size: 1.8rem;
}

.puzzle-selector {
  display: flex;
  align-items: center;
}

.puzzle-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.puzzle-selector select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  min-width: 180px;
  font-size: 1rem;
}

/* 预览容器 */
.preview-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f0f3f9;
  border-bottom: 1px solid #e4e7ed;
}

.preview-header h2 {
  color: #303133;
  font-size: 1.4rem;
}

.reload-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.reload-btn:hover {
  background-color: #337ecc;
}

.reload-icon {
  margin-right: 6px;
  font-size: 1.1rem;
}

.preview-content {
  padding: 20px;
  min-height: 500px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
  text-align: center;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 20px;
}
</style> 