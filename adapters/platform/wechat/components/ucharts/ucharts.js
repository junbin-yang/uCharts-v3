// 引入编译后的UCharts库文件
import UCharts from './ucharts-wechat.min.js';

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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件生命周期函数，在组件实例进入页面节点树时执行
   */
  attached: function() {
    this.initChart();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 初始化图表
     */
    initChart: function() {
      const query = this.createSelectorQuery();
      query.select(`#${this.data.canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            
            // 设置Canvas尺寸
            const dpr = this.data.pixelRatio || wx.getWindowInfo().pixelRatio;
            canvas.width = this.data.width * dpr;
            canvas.height = this.data.height * dpr;
            ctx.scale(dpr, dpr);

            // 创建适配器上下文
            this.canvasContext = new UCharts.WechatCanvasContext(ctx, this.data.width, this.data.height);
            
            // 如果已有图表数据，则创建图表
            if (this.data.chartData && Object.keys(this.data.chartData).length > 0) {
              this.createChart(this.data.chartData);
            }
          }
        });
    },

    /**
     * 创建图表
     */
    createChart: function(chartData) {
      if (!this.canvasContext) {
        console.error('Canvas context not initialized');
        return;
      }

      try {
        const options = {
          ...chartData,
          context: this.canvasContext,
          pixelRatio: this.data.pixelRatio || wx.getWindowInfo().pixelRatio
        };

        this.chart = new UCharts(options);
        
        // 触发图表创建完成事件
        this.triggerEvent('chartCreated', { chart: this.chart });
      } catch (error) {
        console.error('创建图表失败:', error);
        this.triggerEvent('chartError', { error: error.message });
      }
    },

    /**
     * 更新图表数据
     */
    updateChart: function(newData) {
      if (this.chart) {
        this.chart.updateData(newData);
        this.triggerEvent('chartUpdated', { data: newData });
      } else if (this.canvasContext) {
        this.createChart(newData);
      }
    },

    /**
     * 处理触摸开始事件
     */
    touchStart: function(e) {
      if (this.chart) {
        this.chart.touchStart(e);
      }
    },

    /**
     * 处理触摸移动事件
     */
    touchMove: function(e) {
      if (this.chart) {
        this.chart.touchMove(e);
      }
    },

    /**
     * 处理触摸结束事件
     */
    touchEnd: function(e) {
      if (this.chart) {
        this.chart.touchEnd(e);
      }
    },

    /**
     * 处理点击事件
     */
    tap: function(e) {
      if (this.chart) {
        this.chart.tap(e);
      }
    },

    /**
     * 获取图表实例
     */
    getChart: function() {
      return this.chart;
    },

    /**
     * 销毁图表
     */
    destroyChart: function() {
      if (this.chart) {
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