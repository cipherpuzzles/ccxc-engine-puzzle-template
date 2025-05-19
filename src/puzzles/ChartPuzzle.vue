<template>
    <div class="data-chart-component">
      <h2>{{ title }}</h2>
      
      <div class="controls">
        <button @click="refreshData" :disabled="loading">
          {{ loading ? '加载中...' : '刷新数据' }}
        </button>
        <select v-model="chartType">
          <option value="bar">柱状图</option>
          <option value="line">折线图</option>
          <option value="pie">饼图</option>
        </select>
      </div>
      
      <div ref="chartContainer" class="chart-container"></div>
    </div>
  </template>
  
  <script>
  import * as echarts from 'echarts'
  import axios from 'axios'
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import * as _ from 'lodash-es'
  
  export default {
    name: 'DataChartComponent',
    setup() {
      const title = ref('示例组件 - 数据可视化')
      const chartContainer = ref(null)
      const loading = ref(false)
      const chartType = ref('bar')
      const data = ref([])
      let chartInstance = null
      
      // 模拟数据获取
      const fetchData = async () => {
        loading.value = true
        try {
          // 模拟API调用
          const response = await axios.get('https://jsonplaceholder.typicode.com/users')
          // 处理并转换数据
          data.value = _.map(response.data, user => ({
            name: user.name,
            value: _.random(10, 100) // 生成随机值
          }))
        } catch (error) {
          console.error('获取数据失败:', error)
          data.value = [] // 重置数据
        } finally {
          loading.value = false
        }
      }
      
      // 刷新数据
      const refreshData = () => {
        fetchData().then(() => renderChart())
      }
      
      // 渲染图表
      const renderChart = () => {
        if (!chartContainer.value || data.value.length === 0) return
        
        if (chartInstance) {
          chartInstance.dispose()
        }
        
        chartInstance = echarts.init(chartContainer.value)
        
        const names = _.map(data.value, 'name')
        const values = _.map(data.value, 'value')
        
        let option = {
          title: {
            text: '用户数据统计'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['数值']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: names
          },
          yAxis: {
            type: 'value'
          }
        }
        
        // 根据图表类型设置不同选项
        switch(chartType.value) {
          case 'bar':
            option.series = [{
              name: '数值',
              type: 'bar',
              data: values,
              itemStyle: {
                color: '#42b983'
              }
            }]
            break
          case 'line':
            option.series = [{
              name: '数值',
              type: 'line',
              data: values,
              smooth: true,
              itemStyle: {
                color: '#3080ff'
              }
            }]
            break
          case 'pie':
            // 饼图需要不同的数据格式和配置
            option = {
              title: {
                text: '用户数据统计'
              },
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
              },
              legend: {
                orient: 'vertical',
                left: 'left',
                data: names
              },
              series: [{
                name: '数值',
                type: 'pie',
                radius: '50%',
                center: ['50%', '60%'],
                data: data.value,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }]
            }
            break
        }
        
        chartInstance.setOption(option)
        
        // 窗口大小变化时调整图表大小
        window.addEventListener('resize', resizeChart)
      }
      
      // 调整图表大小
      const resizeChart = _.debounce(() => {
        if (chartInstance) {
          chartInstance.resize()
        }
      }, 300)
      
      // 监听图表类型变化，重新渲染
      watch(chartType, () => {
        renderChart()
      })
      
      onMounted(() => {
        // 初始化时获取数据并渲染图表
        refreshData()
      })
      
      onBeforeUnmount(() => {
        // 清理资源
        window.removeEventListener('resize', resizeChart)
        if (chartInstance) {
          chartInstance.dispose()
          chartInstance = null
        }
      })
      
      return {
        title,
        chartContainer,
        loading,
        chartType,
        refreshData
      }
    }
  }
  </script>
  
  <style>
  .data-chart-component {
    padding: 20px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }
  
  .controls {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .controls button, .controls select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  
  .controls button {
    background-color: #42b983;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .controls button:disabled {
    background-color: #a8d5c2;
    cursor: not-allowed;
  }
  
  .chart-container {
    width: 100%;
    height: 400px;
  }
  </style>