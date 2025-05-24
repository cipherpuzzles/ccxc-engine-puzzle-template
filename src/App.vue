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
      <div class="user-section">
        <button v-if="!isLoggedIn" @click="handleLogin" class="login-btn">
          登录
        </button>
        <button v-else @click="showUserDialog = true" class="user-btn">
          {{ currentUser.username }}
        </button>
      </div>
    </header>

    <div v-if="showUserDialog" class="dialog-overlay" @click="showUserDialog = false">
      <div class="dialog-content" @click.stop>
        <h3>用户信息</h3>
        <p><strong>用户名：</strong>{{ currentUser.username }}</p>
        <p><strong>用户ID：</strong>{{ currentUser.uid }}</p>
        <p v-if="currentUser.roleid"><strong>角色ID：</strong>{{ currentUser.roleid }}</p>
        <div class="dialog-actions">
          <button @click="handleLogout" class="logout-btn">退出登录</button>
          <button @click="showUserDialog = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <div v-if="showErrorDialog" class="dialog-overlay" @click="showErrorDialog = false">
      <div class="dialog-content error-dialog" @click.stop>
        <h3>登录失败</h3>
        <p><strong>错误信息：</strong>{{ errorMessage }}</p>
        <p><strong>错误代码：</strong>{{ errorCode }}</p>
        <div class="dialog-actions">
          <button @click="showErrorDialog = false" class="cancel-btn">确定</button>
        </div>
      </div>
    </div>

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
import ySyncDocs from './previewComponents/ySyncDocs';

export default {
  name: 'App',
  data() {
    return {
      puzzles: [],
      selectedPuzzle: '',
      currentPuzzleComponent: null,
      isLoggedIn: false,
      currentUser: {
        uid: '',
        username: '',
        roleid: '',
        token: '',
        sk: '',
        etc: '',
        color: ''
      },
      showUserDialog: false,
      showErrorDialog: false,
      errorMessage: '',
      errorCode: ''
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

    // 检查登录状态
    this.checkLoginStatus();
  },
  mounted() {
    // 处理SSO登录结果
    this.handleSSOCallback();
  },
  beforeUnmount() {
    // 页面关闭时断开连接
    ySyncDocs.disconnect();
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
    },
    // 检查本地存储中的登录状态
    checkLoginStatus() {
      const token = localStorage.getItem('userToken');
      const username = localStorage.getItem('username');
      
      if (token && username) {
        this.isLoggedIn = true;
        this.currentUser = {
          uid: localStorage.getItem('uid') || '',
          username: localStorage.getItem('username') || '',
          roleid: localStorage.getItem('roleid') || '',
          token: localStorage.getItem('userToken') || '',
          sk: localStorage.getItem('sk') || '',
          etc: localStorage.getItem('etc') || '',
          color: localStorage.getItem('color') || ''
        };
        
        // 如果用户已登录，连接ySyncDocs
        ySyncDocs.connect(token);
      }
    },
    // 处理登录
    async handleLogin() {
      try {
        // 获取SSO登录服务器地址
        const backendRoot = import.meta.env.VITE_BACKEND_ROOT;
        const response = await fetch(`${backendRoot}/v1/get-sso-prefix`);
        const result = await response.json();
        
        if (result.prefix) {
          const redirectUrl = encodeURIComponent(window.location.protocol + "//" + window.location.host + "/");
          const ssoUrl = `${result.prefix}/user/sso?app=ccxc&token=sso-from-backend&redirect=${redirectUrl}`;
          
          // 跳转到SSO登录页面
          window.location.href = ssoUrl;
        } else {
          console.error('获取SSO地址失败');
        }
      } catch (error) {
        console.error('登录失败:', error);
      }
    },
    // 处理SSO登录回调
    handleSSOCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const result = urlParams.get('result');
      
      if (result === 'failed') {
        // 登录失败
        this.errorMessage = urlParams.get('message') || '登录失败';
        this.errorCode = urlParams.get('code') || '未知错误';
        this.showErrorDialog = true;
        
        // 清理URL参数
        this.clearURLParams();
      } else if (result === 'ok') {
        // 登录成功
        const userData = {
          uid: urlParams.get('uid'),
          username: urlParams.get('username'),
          roleid: urlParams.get('roleid'),
          token: urlParams.get('token'),
          sk: urlParams.get('sk'),
          etc: urlParams.get('etc'),
          color: urlParams.get('color')
        };
        
        // 存储到localStorage
        Object.entries(userData).forEach(([key, value]) => {
          if (value) {
            if (key === 'token') {
              localStorage.setItem('userToken', value);
            } else {
              localStorage.setItem(key, value);
            }
          }
        });
        
        // 更新组件状态
        this.isLoggedIn = true;
        this.currentUser = userData;
        
        // SSO登录成功后连接ySyncDocs
        if (userData.token) {
          ySyncDocs.connect(userData.token);
        }
        
        // 清理URL参数
        this.clearURLParams();
      }
    },
    // 清理URL参数
    clearURLParams() {
      const url = new URL(window.location);
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
    },
    // 处理退出登录
    handleLogout() {
      // 断开ySyncDocs连接
      ySyncDocs.disconnect();
      
      // 清除localStorage中的用户信息
      ['uid', 'username', 'roleid', 'userToken', 'sk', 'etc', 'color'].forEach(key => {
        localStorage.removeItem(key);
      });
      
      // 重置组件状态
      this.isLoggedIn = false;
      this.currentUser = {
        uid: '',
        username: '',
        roleid: '',
        token: '',
        sk: '',
        etc: '',
        color: ''
      };
      this.showUserDialog = false;
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
  max-width: 1400px;
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

/* 用户区域样式 */
.user-section {
  margin-left: 20px;
}

.login-btn {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #337ecc;
}

.user-btn {
  padding: 8px 16px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.user-btn:hover {
  background-color: #529b2e;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog-content h3 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 1.2rem;
}

.dialog-content p {
  margin-bottom: 12px;
  color: #606266;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #f56c6c;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #909399;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #767a82;
}

.error-dialog h3 {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .puzzle-selector {
    align-self: stretch;
  }
  
  .user-section {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style> 