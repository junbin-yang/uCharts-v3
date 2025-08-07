/**
 * 现代化Loading组件
 * 统一管理多种加载状态和动画效果
 */
Component({
  properties: {
    // 是否显示loading
    visible: {
      type: Boolean,
      value: false
    },
    // 加载类型：spinner(旋转), progress(进度条), skeleton(骨架屏), pulse(脉冲), dots(点动画)
    type: {
      type: String,
      value: 'spinner'
    },
    // 加载文案
    text: {
      type: String,
      value: '加载中...'
    },
    // 是否显示遮罩层
    mask: {
      type: Boolean,
      value: true
    },
    // 遮罩层是否可点击关闭
    maskClosable: {
      type: Boolean,
      value: false
    },
    // 主题色
    color: {
      type: String,
      value: '#0052D9'
    },
    // 尺寸：small, medium, large
    size: {
      type: String,
      value: 'medium'
    },
    // 进度值（仅在type为progress时有效）
    progress: {
      type: Number,
      value: 0
    },
    // 是否显示进度百分比
    showProgress: {
      type: Boolean,
      value: false
    },
    // 自定义样式类名
    customClass: {
      type: String,
      value: ''
    },
    // 延迟显示时间（毫秒）
    delay: {
      type: Number,
      value: 0
    }
  },

  data: {
    // 内部显示状态
    innerVisible: false,
    // 延迟定时器
    delayTimer: null,
    // 动画状态
    animationData: {}
  },

  observers: {
    'visible': function(newVal) {
      this.handleVisibleChange(newVal);
    },
    'type': function(newVal) {
      this.initAnimation(newVal);
    }
  },

  lifetimes: {
    attached() {
      this.initAnimation(this.data.type);
    },
    detached() {
      this.clearDelayTimer();
    }
  },

  methods: {
    /**
     * 处理显示状态变化
     */
    handleVisibleChange(visible) {
      if (visible) {
        if (this.data.delay > 0) {
          this.data.delayTimer = setTimeout(() => {
            this.setData({ innerVisible: true });
            this.startAnimation();
          }, this.data.delay);
        } else {
          this.setData({ innerVisible: true });
          this.startAnimation();
        }
      } else {
        this.clearDelayTimer();
        this.setData({ innerVisible: false });
        this.stopAnimation();
      }
    },

    /**
     * 初始化动画
     */
    initAnimation(type) {
      const animation = wx.createAnimation({
        duration: this.getAnimationDuration(type),
        timingFunction: 'linear',
        transformOrigin: '50% 50%'
      });

      this.animation = animation;
      this.startAnimation();
    },

    /**
     * 获取动画持续时间
     */
    getAnimationDuration(type) {
      const durations = {
        spinner: 1000,
        pulse: 1500,
        dots: 1200,
        progress: 300,
        skeleton: 2000
      };
      return durations[type] || 1000;
    },

    /**
     * 开始动画
     */
    startAnimation() {
      if (!this.data.innerVisible || !this.animation) return;

      const type = this.data.type;
      
      switch (type) {
        case 'spinner':
          this.spinnerAnimation();
          break;
        case 'pulse':
          this.pulseAnimation();
          break;
        case 'dots':
          this.dotsAnimation();
          break;
        default:
          break;
      }
    },

    /**
     * 旋转动画
     */
    spinnerAnimation() {
      const animation = this.animation;
      animation.rotate(360).step();
      this.setData({
        animationData: animation.export()
      });

      if (this.data.innerVisible) {
        setTimeout(() => {
          animation.rotate(0).step({ duration: 0 });
          this.setData({
            animationData: animation.export()
          });
          this.spinnerAnimation();
        }, 1000);
      }
    },

    /**
     * 脉冲动画
     */
    pulseAnimation() {
      const animation = this.animation;
      animation.scale(1.2).opacity(0.6).step();
      animation.scale(1).opacity(1).step();
      
      this.setData({
        animationData: animation.export()
      });

      if (this.data.innerVisible) {
        setTimeout(() => {
          this.pulseAnimation();
        }, 1500);
      }
    },

    /**
     * 点动画
     */
    dotsAnimation() {
      // 点动画通过CSS实现，这里只是占位
      if (this.data.innerVisible) {
        setTimeout(() => {
          this.dotsAnimation();
        }, 1200);
      }
    },

    /**
     * 停止动画
     */
    stopAnimation() {
      if (this.animation) {
        this.animation.rotate(0).scale(1).opacity(1).step({ duration: 0 });
        this.setData({
          animationData: this.animation.export()
        });
      }
    },

    /**
     * 清除延迟定时器
     */
    clearDelayTimer() {
      if (this.data.delayTimer) {
        clearTimeout(this.data.delayTimer);
        this.setData({ delayTimer: null });
      }
    },

    /**
     * 遮罩层点击事件
     */
    onMaskTap() {
      if (this.data.maskClosable) {
        this.triggerEvent('close');
      }
    },

    /**
     * 获取尺寸类名
     */
    getSizeClass() {
      const sizeMap = {
        small: 'loading-small',
        medium: 'loading-medium',
        large: 'loading-large'
      };
      return sizeMap[this.data.size] || 'loading-medium';
    },

    /**
     * 获取类型类名
     */
    getTypeClass() {
      return `loading-${this.data.type}`;
    }
  }
});