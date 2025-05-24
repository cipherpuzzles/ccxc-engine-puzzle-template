<template>
  <div class="puzzle-container">
      <div class="intro-section">
          <h2 class="section-title">Vue 题目示例</h2>
          <p>这里是一个VUE题目示例。</p>
          <p>一个VUE题目，就是一个VUE SFC，相关定义可以参考<a href="https://cn.vuejs.org/guide/scaling-up/sfc.html" target="_blank" class="link">VUE官网</a>。</p>
          <p>一般来说，VUE SFC分为三个部分，&lt;template> 、 &lt;style> 和 &lt;script> 。</p>
          <p>在CCXC Engine的编辑器中，你需要将 &lt;template> 和 &lt;style> 放在 "题目HTML" 中，而将 &lt;script> 写在"题目脚本"中（由于浏览器内不支持import所以需要特殊写法） </p>
          <p>此外，在"题目HTML"中，还可以特别定义 &lt;data> 段，用来给后端代码存储数据。这部分内容前端无法查看。</p>
      </div>

      <div class="card">
          <h3 class="card-title">🎮 互动组件演示</h3>
          <p>下面是一些动态的组件，比如输入框，按钮啥的，可以以此进行用户交互。当然在代码里监听用户鼠标键盘事件也是可行的。</p>
      </div>

      <div class="card highlight-card">
          <h3 class="card-title">🎯 隐藏内容</h3>
          <p>这里有一些隐藏的数据，如果你通关了下面这个游戏，你或许就能找到方法看到它。</p>
          <div class="secret-content">{{ backRes.extra }}</div>
      </div>

      <div class="game-card">
          <h3 class="card-title">🎲 数字猜谜游戏</h3>
          <div class="game-info">
              <div class="level-display">第 {{ backRes.level }} 关</div>
              <div class="current-input">
                  <label>当前输入：</label>
                  <span class="number-display">{{ currentNumber }}</span>
              </div>
          </div>
          
          <div class="input-section">
              <div class="el-input" style="width: 150px">
                  <div class="el-input__wrapper">
                      <input class="el-input__inner" type="number" v-model="currentNumber" placeholder="输入数字" />
                  </div>
              </div>
              <div class="button-group">
                  <button class="el-button el-button--primary" @click="changeNum(1)">+1</button>
                  <button class="el-button el-button--primary" @click="changeNum(-1)">-1</button>
              </div>
          </div>

          <div class="action-section">
              <h4>游戏操作</h4>
              <div class="button-group">
                  <button class="el-button el-button--primary" @click="processBackend(0)">🎯 猜！</button>
                  <button class="el-button el-button--secondary" @click="processBackend(1)">🔄 重置</button>
              </div>
          </div>

          <div class="result-section">
              <h4>后端返回</h4>
              <div class="result-item">{{ backRes.backTest }}</div>
              <div class="result-item">{{ backRes.backResult }}</div>
              <div class="result-item">{{ backRes.backUser }}</div>
          </div>
      </div>

      <div class="card purchase-card">
          <h3 class="card-title">💰 快速通关</h3>
          <p>不想玩游戏？很简单，你可以花费 <strong>3000 能量</strong> 来跳过关卡，直接看到最后答案！</p>
          <button class="el-button el-button--warning" @click="buy()">💎 购买（花费 3000 能量）</button>
      </div>

      <div class="card location-card">
          <h3 class="card-title">📍 地理定位测试</h3>
          <div class="location-actions">
              <button class="el-button el-button--info" @click="getPostion()">📍 获取定位</button>
          </div>
          <div class="location-info">
              <div class="info-grid">
                  <div class="info-item">
                      <span class="info-label">定位时间：</span>
                      <span class="info-value">{{ formatTimestamp(geoPosition.posTime) }}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">经度：</span>
                      <span class="info-value">{{ geoPosition.longitude }}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">纬度：</span>
                      <span class="info-value">{{ geoPosition.latitude }}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">高度：</span>
                      <span class="info-value">{{ geoPosition.altitude }}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">速度：</span>
                      <span class="info-value">{{ geoPosition.speed }}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">角度：</span>
                      <span class="info-value">{{ geoPosition.heading }}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">精确度：</span>
                      <span class="info-value">{{ geoPosition.accuracy }}</span>
                  </div>
              </div>
              <div v-if="geoPositionErr.code != 0" class="error-message">
                  ❌ 定位失败：{{ geoPositionErr.code }}，原因为：{{ geoPositionErr.message }}
              </div>
          </div>
      </div>
  </div>
</template>

<style scoped>
/* 整体容器 */
.puzzle-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 标题样式 */
.section-title {
  font-size: 2.5em;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 介绍区域 */
.intro-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 卡片样式 */
.card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 1.4em;
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 特殊卡片样式 */
.highlight-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.highlight-card .card-title {
  color: white;
}

.secret-content {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 8px;
  font-weight: 500;
  min-height: 20px;
}

.game-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin-bottom: 25px;
}

.game-card .card-title {
  color: white;
  font-size: 1.6em;
}

.purchase-card {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-left: 5px solid #ff6b6b;
}

.location-card {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

/* 游戏信息布局 */
.game-info {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.level-display {
  background: rgba(255, 255, 255, 0.3);
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1.1em;
}

.current-input {
  background: rgba(255, 255, 255, 0.3);
  padding: 12px 20px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.number-display {
  background: rgba(255, 255, 255, 0.5);
  padding: 5px 15px;
  border-radius: 15px;
  font-weight: 700;
  color: #2c3e50;
}

/* 输入和按钮区域 */
.input-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.action-section {
  margin-bottom: 25px;
}

.action-section h4 {
  color: white;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 结果显示区域 */
.result-section h4 {
  color: white;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.result-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-weight: 500;
}

/* 定位信息网格 */
.location-actions {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.info-item {
  background: rgba(255, 255, 255, 0.7);
  padding: 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
}

.info-value {
  font-weight: 500;
  color: #34495e;
  word-break: break-all;
}

.error-message {
  background: #ff6b6b;
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-weight: 500;
}

/* 链接样式 */
.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 按钮样式优化 */
.el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #ffffff;
  border: 2px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0 8px 8px 0;
  font-weight: 600;
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 25px;
  transition: all 0.3s ease;
  text-decoration: none;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.el-button:hover::before {
  left: 100%;
}

.el-button:hover {
  color: #409eff;
  border-color: #409eff;
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
}

.el-button--primary {
  color: #ffffff;
  background: linear-gradient(45deg, #409eff, #66b1ff);
  border-color: #409eff;
}

.el-button--primary:hover {
  background: linear-gradient(45deg, #66b1ff, #85c1ff);
  border-color: #66b1ff;
  color: #ffffff;
  box-shadow: 0 5px 15px rgba(102, 177, 255, 0.4);
}

.el-button--secondary {
  color: #ffffff;
  background: linear-gradient(45deg, #909399, #b1b3b8);
  border-color: #909399;
}

.el-button--secondary:hover {
  background: linear-gradient(45deg, #b1b3b8, #c8c9cc);
  border-color: #b1b3b8;
  box-shadow: 0 5px 15px rgba(144, 147, 153, 0.4);
}

.el-button--warning {
  color: #ffffff;
  background: linear-gradient(45deg, #e6a23c, #f0c975);
  border-color: #e6a23c;
}

.el-button--warning:hover {
  background: linear-gradient(45deg, #f0c975, #f3d19e);
  border-color: #f0c975;
  box-shadow: 0 5px 15px rgba(230, 162, 60, 0.4);
}

.el-button--info {
  color: #ffffff;
  background: linear-gradient(45deg, #909399, #b1b3b8);
  border-color: #909399;
}

.el-button--info:hover {
  background: linear-gradient(45deg, #b1b3b8, #c8c9cc);
  border-color: #b1b3b8;
  box-shadow: 0 5px 15px rgba(144, 147, 153, 0.4);
}

/* 输入框样式优化 */
.el-input {
  position: relative;
  font-size: 14px;
  display: inline-block;
  width: 100%;
}

.el-input__wrapper {
  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 1px 15px;
  background-color: #ffffff;
  background-image: none;
  border-radius: 25px;
  border: 2px solid #dcdfe6;
  box-sizing: border-box;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.el-input__wrapper:hover {
  border-color: #c0c4cc;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.el-input__wrapper:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.el-input__inner {
  width: 100%;
  flex-grow: 1;
  border: none;
  outline: none;
  padding: 0;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #606266;
  background: none;
  box-sizing: border-box;
  font-weight: 500;
}

.el-input__inner::placeholder {
  color: #c0c4cc;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .puzzle-container {
    padding: 15px;
  }
  
  .section-title {
    font-size: 2em;
  }
  
  .game-info {
    flex-direction: column;
    gap: 15px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .input-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .button-group {
    justify-content: center;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.6s ease-out;
}

.intro-section {
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.game-card {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}
</style>

<script>
import { ref, reactive, inject, onMounted } from 'vue';


//必须存在一个全局导出对象 export default {} ，此对象作为当前页面Vue的实例对象。因此，这里只能使用options语法。
export default {
    //建议参考Vue 3.0 官方文档中setup函数写法，将所有逻辑都写在setup函数内。这样你就可以在setup函数内使用好用的vue3.0语法。
    setup() {
        const currentNumber = ref(0); //所有需要被vue控制的变量都需要使用 ref 建立。同理，所有对象都需要用 reactive 建立。
        const backRes = reactive({
            level: 0,
            backTest: "...",
            backResult: "...",
            backUser: "...",
            extra: "",
        });

        const geoPosition = reactive({
            posTime: 0,
            longitude: 0,
            latitude: 0,
            altitude: 0,
            accuracy: 0,
            heading: 0,
            speed: 0
        });
        const geoPositionErr = reactive({
            code: 0,
            message: ""
        })

        const backend = inject("backend"); //通过 inject 函数可以获取预先注入的工具。可使用的工具如下：
        /**
         * api(url: string, data: any) : Promise<any> 调用后端API
         * backend(key: string, data: any) : Promise<any> 调用后端题目脚本（"题目脚本"模块中定义的脚本）
         * adjustTextColor(color: string): "#000000" | "#ffffff" 根据传入的背景色返回黑色或白色，使得这个颜色的文本能在指定的背景下看清楚，用于动态生成背景色时显示文本使用。
         * formatTimestamp(timestamp: number, format?: string): string 格式化时间戳
         * markdownToHtml(markdown: string): string 转换markdown到HTML
         * sleep(ms: number): Promise<unknown> 延时指定的毫秒数
        */
        const formatTimestamp = inject("formatTimestamp");

        const changeNum = (s) => {
            currentNumber.value += s; //记住在代码中使用ref对象时，需要用 对象名.value 来访问其中的数据。
        }

        const processBackend = async (type) => {
            let data = await backend("c15-d1", {
                a: currentNumber.value,
                type: type
            });
            backRes.level = data.level;
            backRes.backTest = data.test;
            backRes.backResult = data.result;
            backRes.backUser = data.user;
            backRes.extra = data.extra;
        }

        const buy = async () => {
            let result = await backend("c15-d1", {
                b: "buy"
            });
            if (result && result.buy) {
                backRes.backResult = "购买成功！"
            } else {
                backRes.backResult = "购买失败！请检查你的余额。"
            }
        }

        const getPostion = () => {
            navigator.geolocation.getCurrentPosition((pos) => {
                geoPosition.posTime = pos.timestamp;
                geoPosition.longitude = pos.coords.longitude;
                geoPosition.latitude = pos.coords.latitude;
                geoPosition.altitude = pos.coords.altitude;
                geoPosition.speed = pos.coords.speed;
                geoPosition.heading = pos.coords.heading;
                geoPosition.accuracy = pos.coords.accuracy;
            }, (err) => {
                geoPositionErr.code = err.code;
                geoPositionErr.message = err.message;
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        }

        //onMounted是VUE提供的生命周期钩子，它会在整个VUE组件渲染好以后自动调用。更多生命周期钩子请参考VUE官方文档
        //我们这里使用onMounted，一般是为了初始化。当然初始化也可以放在其他的生命周期里。
        onMounted(() => {
            processBackend(0);
            getPostion();
        });

        //所有在页面上使用的对象，都需要这里return出去
        return {
            currentNumber,
            backRes,
            changeNum,
            processBackend,
            geoPosition,
            formatTimestamp,
            geoPositionErr,
            getPostion,
            buy
        }
    }
}
</script>

