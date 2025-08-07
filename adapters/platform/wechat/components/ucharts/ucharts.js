// 引入编译后的UCharts库文件
import UCharts from './wx-ucharts-v3.min.js';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图表配置选项
    chartData: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.updateChart(newVal);
        }
      }
    },
    // Canvas ID
    canvasId: {
      type: String,
      value: 'ucharts'
    },
    // Canvas 宽度
    width: {
      type: Number,
      value: 375
    },
    // Canvas 高度  
    height: {
      type: Number,
      value: 250
    },
    // 像素比
    pixelRatio: {
      type: Number,
      value: 1
    },
    // 是否显示加载状态
    showLoading: {
      type: Boolean,
      value: true
    },
    // 加载类型：spinner, progress, skeleton, pulse, dots
    loadingType: {
      type: String,
      value: 'skeleton'
    },
    // 加载文案
    loadingText: {
      type: String,
      value: '加载图表数据...'
    },
    // 是否显示错误状态
    showError: {
      type: Boolean,
      value: true
    },
    // 错误信息
    errorMessage: {
      type: String,
      value: null
    },
    // 是否支持错误重试
    errorReload: {
      type: Boolean,
      value: true
    },
    // 背景色
    background: {
      type: String,
      value: 'rgba(0,0,0,0)'
    },
    // 是否启用动画
    animation: {
      type: Boolean,
      value: true
    },
    // 是否启用触摸交互
    enableTouch: {
      type: Boolean,
      value: true
    },
    // 是否启用点击事件
    enableTap: {
      type: Boolean,
      value: true
    },
    // 是否显示工具提示
    showTooltip: {
      type: Boolean,
      value: true
    },
    // 延迟显示时间（毫秒）
    delay: {
      type: Number,
      value: 300
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 内部状态
    isLoading: false,
    hasError: false,
    isInitialized: false,
    // Canvas尺寸
    canvasWidth: 375,
    canvasHeight: 250
  },

  observers: {
    'chartData.**': function(val) {
      if (typeof val === 'object' && val !== null) {
        if (val.series && val.series.length > 0) {
          this.setData({ 
            hasError: false,
            errorMessage: null 
          });
          this.initChart();
        } else {
          this.setData({ 
            isLoading: true,
            hasError: false 
          });
        }
      } else if (val !== null) {
        this.setData({
          isLoading: false,
          hasError: true,
          errorMessage: '参数错误：chartData数据类型错误'
        });
      }
    },
    'errorMessage': function(val) {
      if (val && val !== null && val !== 'null' && val !== '') {
        this.setData({
          isLoading: false,
          hasError: true
        });
      } else {
        this.setData({
          hasError: false
        });
        if (this.data.chartData && Object.keys(this.data.chartData).length > 0) {
          this.reloadChart();
        }
      }
    }
  },

  /**
   * 组件生命周期函数，在组件实例进入页面节点树时执行
   */
  attached: function() {
    // 生成唯一的canvas ID
    if (this.data.canvasId === 'ucharts') {
      const randomId = this.generateRandomId();
      this.setData({ canvasId: randomId });
    }
    
    // 设置canvas尺寸
    this.setData({
      canvasWidth: this.data.width,
      canvasHeight: this.data.height
    });
  },

  /**
   * 组件生命周期函数，在组件布局完成后执行
   */
  ready: function() {
    // 在组件布局完成后再初始化图表
    setTimeout(() => {
      if (this.data.chartData && Object.keys(this.data.chartData).length > 0) {
        this.initChart();
      }
    }, 300);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 生成随机ID
     */
    generateRandomId: function() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let result = 'ucharts_';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },

    /**
     * 初始化图表
     */
    initChart: function() {
      if (this.data.showLoading) {
        this.setData({ isLoading: true });
      }

      // 延迟显示loading，避免快速加载时的闪烁
      const delayTime = this.data.delay || 0;
      
      setTimeout(() => {
        this.createCanvas();
      }, delayTime);
    },

    /**
     * 创建Canvas上下文
     */
    createCanvas: function() {
      // 确保在下一个事件循环中执行，让DOM完全渲染
      wx.nextTick(() => {
        const query = this.createSelectorQuery();
        query.select(`#${this.data.canvasId}`)
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res && res[0] && res[0].node) {
              const canvas = res[0].node;
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                this.handleError('Canvas上下文获取失败');
                return;
              }
              
              // 设置Canvas尺寸
              const dpr = this.data.pixelRatio || wx.getWindowInfo().pixelRatio;
              canvas.width = this.data.width * dpr;
              canvas.height = this.data.height * dpr;
              ctx.scale(dpr, dpr);

              // 创建适配器上下文
              this.canvasContext = new UCharts.WechatCanvasContext(ctx, this.data.width, this.data.height);
              
              // 创建图表
              this.createChart(this.data.chartData);
            } else {
              // 如果第一次获取失败，延迟重试
              setTimeout(() => {
                this.retryCreateCanvas();
              }, 200);
            }
          });
      });
    },

    /**
     * 重试创建Canvas
     */
    retryCreateCanvas: function() {
      const query = this.createSelectorQuery();
      query.select(`#${this.data.canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0] && res[0].node) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              this.handleError('Canvas上下文获取失败');
              return;
            }
            
            // 设置Canvas尺寸
            const dpr = this.data.pixelRatio || wx.getWindowInfo().pixelRatio;
            canvas.width = this.data.width * dpr;
            canvas.height = this.data.height * dpr;
            ctx.scale(dpr, dpr);

            // 创建适配器上下文
            this.canvasContext = new UCharts.WechatCanvasContext(ctx, this.data.width, this.data.height);
            
            // 创建图表
            this.createChart(this.data.chartData);
          } else {
            this.handleError('Canvas初始化失败：未获取到Canvas节点');
          }
        });
    },

    /**
     * 创建图表
     */
    createChart: function(chartData) {
      if (!this.canvasContext) {
        this.handleError('Canvas上下文未初始化');
        return;
      }

      try {
        // 构建图表配置
        const config = {
          ...chartData,
          context: this.canvasContext,
          animation: this.data.animation,
          background: this.data.background === 'rgba(0,0,0,0)' ? '#FFFFFF' : this.data.background,
          pixelRatio: this.data.pixelRatio || wx.getWindowInfo().pixelRatio
        };

        // 创建图表实例
        this.chart = new UCharts(config);
        
        // 设置状态
        this.setData({
          isLoading: false,
          hasError: false,
          isInitialized: true
        });
        
        // 触发图表创建完成事件
        this.triggerEvent('chartCreated', { 
          chart: this.chart,
          canvasId: this.data.canvasId
        });

        // 触发渲染完成事件
        this.triggerEvent('renderComplete', {
          type: 'complete',
          complete: true,
          canvasId: this.data.canvasId
        });

      } catch (error) {
        console.error('创建图表失败:', error);
        this.handleError(`创建图表失败: ${error.message}`);
      }
    },

    /**
     * 更新图表数据
     */
    updateChart: function(newData) {
      if (this.chart && this.data.isInitialized) {
        try {
          this.chart.updateData(newData);
          this.triggerEvent('chartUpdated', { 
            data: newData,
            canvasId: this.data.canvasId
          });
        } catch (error) {
          console.error('更新图表失败:', error);
          this.handleError(`更新图表失败: ${error.message}`);
        }
      } else if (this.canvasContext) {
        this.createChart(newData);
      } else {
        this.initChart();
      }
    },

    /**
     * 重新加载图表
     */
    reloadChart: function() {
      this.setData({
        isLoading: false,
        hasError: false,
        isInitialized: false
      });
      
      // 清理现有图表
      this.destroyChart();
      
      // 重新初始化
      setTimeout(() => {
        this.initChart();
      }, 100);
    },

    /**
     * 处理错误
     */
    handleError: function(errorMsg) {
      this.setData({
        isLoading: false,
        hasError: true,
        errorMessage: errorMsg
      });

      this.triggerEvent('chartError', { 
        error: errorMsg,
        canvasId: this.data.canvasId
      });

      if (this.data.showError) {
        console.error('[uCharts组件]', errorMsg);
      }
    },

    /**
     * 错误重试
     */
    onErrorRetry: function() {
      if (this.data.errorReload) {
        this.reloadChart();
        this.triggerEvent('errorRetry', {
          canvasId: this.data.canvasId
        });
      }
    },

    /**
     * 处理触摸开始事件
     */
    touchStart: function(e) {
      if (this.chart && this.data.enableTouch) {
        this.chart.touchStart(e);
        this.triggerEvent('touchStart', {
          event: e.changedTouches,
          canvasId: this.data.canvasId
        });
      }
    },

    /**
     * 处理触摸移动事件
     */
    touchMove: function(e) {
      if (this.chart && this.data.enableTouch) {
        this.chart.touchMove(e);
        this.triggerEvent('touchMove', {
          event: e.changedTouches,
          canvasId: this.data.canvasId
        });
      }
    },

    /**
     * 处理触摸结束事件
     */
    touchEnd: function(e) {
      if (this.chart && this.data.enableTouch) {
        this.chart.touchEnd(e);
        this.triggerEvent('touchEnd', {
          event: e.changedTouches,
          canvasId: this.data.canvasId
        });
      }
    },

    /**
     * 处理点击事件
     */
    tap: function(e) {
      if (this.chart && this.data.enableTap) {
        this.chart.tap(e);
        
        // 获取点击的数据索引
        const currentIndex = this.chart.getCurrentDataIndex ? this.chart.getCurrentDataIndex(e) : null;
        const legendIndex = this.chart.getLegendDataIndex ? this.chart.getLegendDataIndex(e) : null;
        
        this.triggerEvent('chartTap', {
          event: e,
          currentIndex: currentIndex,
          legendIndex: legendIndex,
          canvasId: this.data.canvasId
        });
      }
    },

    /**
     * 显示工具提示
     */
    showTooltip: function(e) {
      if (this.chart && this.data.showTooltip) {
        this.chart.showToolTip(e, {
          formatter: (item, category, index, opts) => {
            if (category) {
              let data = item.data;
              if (typeof item.data === "object") {
                data = item.data.value;
              }
              return `${category} ${item.name}: ${data}`;
            } else {
              if (item.properties && item.properties.name) {
                return item.properties.name;
              } else {
                return `${item.name}: ${item.data}`;
              }
            }
          }
        });
      }
    },

    /**
     * 获取图表实例
     */
    getChart: function() {
      return this.chart;
    },

    /**
     * 获取Canvas上下文
     */
    getCanvasContext: function() {
      return this.canvasContext;
    },

    /**
     * 保存图表为图片
     */
    saveImage: function() {
      if (!this.data.isInitialized) {
        wx.showToast({
          title: '图表未初始化',
          icon: 'none'
        });
        return;
      }

      wx.canvasToTempFilePath({
        canvasId: this.data.canvasId,
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({
                title: '保存成功',
                duration: 2000
              });
            },
            fail: (err) => {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              });
              console.error('保存图片失败:', err);
            }
          });
        },
        fail: (err) => {
          wx.showToast({
            title: '生成图片失败',
            icon: 'none'
          });
          console.error('生成图片失败:', err);
        }
      }, this);
    },

    /**
     * 销毁图表
     */
    destroyChart: function() {
      if (this.chart) {
        // 清理事件监听器
        if (this.chart.removeEventListener) {
          this.chart.removeEventListener('renderComplete');
          this.chart.removeEventListener('scrollLeft');
          this.chart.removeEventListener('scrollRight');
        }
        this.chart = null;
      }
      if (this.canvasContext) {
        this.canvasContext = null;
      }
    }
  },

  /**
   * 组件生命周期函数，在组件实例被从页面节点树移除时执行
   */
  detached: function() {
    this.destroyChart();
  }
});