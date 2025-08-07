/**
 * 全局Loading管理器
 * 统一管理应用中的loading状态，避免重复显示和状态混乱
 */
class LoadingManager {
  constructor() {
    // loading计数器，支持嵌套调用
    this.loadingCount = 0;
    // 当前loading配置
    this.currentConfig = null;
    // loading实例引用
    this.loadingInstance = null;
    // 默认配置
    this.defaultConfig = {
      type: 'spinner',
      text: '加载中...',
      mask: true,
      maskClosable: false,
      color: '#0052D9',
      size: 'medium',
      delay: 0
    };
  }

  /**
   * 显示loading
   * @param {Object} options 配置选项
   */
  show(options = {}) {
    this.loadingCount++;
    
    // 合并配置
    const config = { ...this.defaultConfig, ...options };
    this.currentConfig = config;

    // 如果是第一次显示，创建loading实例
    if (this.loadingCount === 1) {
      this.createLoadingInstance(config);
    }

    return this;
  }

  /**
   * 隐藏loading
   */
  hide() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    
    // 当计数器为0时，真正隐藏loading
    if (this.loadingCount === 0) {
      this.hideLoadingInstance();
    }

    return this;
  }

  /**
   * 强制隐藏loading（清空计数器）
   */
  forceHide() {
    this.loadingCount = 0;
    this.hideLoadingInstance();
    return this;
  }

  /**
   * 更新loading配置
   * @param {Object} options 新的配置选项
   */
  update(options = {}) {
    if (this.loadingCount > 0 && this.currentConfig) {
      this.currentConfig = { ...this.currentConfig, ...options };
      this.updateLoadingInstance(this.currentConfig);
    }
    return this;
  }

  /**
   * 创建loading实例
   * @param {Object} config 配置选项
   */
  createLoadingInstance(config) {
    // 获取当前页面实例
    const pages = getCurrentPages();
    if (pages.length === 0) return;

    const currentPage = pages[pages.length - 1];
    
    // 设置页面数据
    currentPage.setData({
      'globalLoading.visible': true,
      'globalLoading.type': config.type,
      'globalLoading.text': config.text,
      'globalLoading.mask': config.mask,
      'globalLoading.maskClosable': config.maskClosable,
      'globalLoading.color': config.color,
      'globalLoading.size': config.size,
      'globalLoading.delay': config.delay,
      'globalLoading.progress': config.progress || 0,
      'globalLoading.showProgress': config.showProgress || false,
      'globalLoading.customClass': config.customClass || ''
    });

    this.loadingInstance = currentPage;
  }

  /**
   * 隐藏loading实例
   */
  hideLoadingInstance() {
    if (this.loadingInstance) {
      this.loadingInstance.setData({
        'globalLoading.visible': false
      });
      this.loadingInstance = null;
    }
    this.currentConfig = null;
  }

  /**
   * 更新loading实例
   * @param {Object} config 新的配置选项
   */
  updateLoadingInstance(config) {
    if (this.loadingInstance) {
      const updateData = {};
      Object.keys(config).forEach(key => {
        if (key !== 'visible') {
          updateData[`globalLoading.${key}`] = config[key];
        }
      });
      this.loadingInstance.setData(updateData);
    }
  }

  /**
   * 获取当前loading状态
   */
  isLoading() {
    return this.loadingCount > 0;
  }

  /**
   * 获取loading计数
   */
  getLoadingCount() {
    return this.loadingCount;
  }

  /**
   * 预设配置方法
   */
  
  // 显示数据加载loading
  showDataLoading(text = '加载数据中...') {
    return this.show({
      type: 'spinner',
      text,
      delay: 300
    });
  }

  // 显示上传进度loading
  showUploadLoading(progress = 0) {
    return this.show({
      type: 'progress',
      text: '上传中...',
      progress,
      showProgress: true
    });
  }

  // 显示图表加载loading
  showChartLoading(text = '加载图表数据...') {
    return this.show({
      type: 'skeleton',
      text,
      mask: false,
      customClass: 'loading-chart'
    });
  }

  // 显示页面加载loading
  showPageLoading(text = '页面加载中...') {
    return this.show({
      type: 'pulse',
      text,
      size: 'large'
    });
  }

  // 显示网络请求loading
  showNetworkLoading(text = '请求中...') {
    return this.show({
      type: 'dots',
      text,
      delay: 200
    });
  }
}

// 创建全局实例
const loadingManager = new LoadingManager();

// 导出模块
module.exports = loadingManager;