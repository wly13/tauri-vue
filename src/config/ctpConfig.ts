// CTP 配置管理
export interface CtpServerConfig {
  name: string;
  brokerId: string;
  tradeFront: string;
  marketFront: string;
  authCode?: string;
  userProductInfo?: string;
  appId?: string;
}

// 预定义的服务器配置
export const CTP_SERVERS: Record<string, CtpServerConfig> = {
  // 模拟环境
  simnow: {
    name: 'SimNow模拟环境',
    brokerId: '9999',
    tradeFront: 'tcp://180.168.146.187:10130',
    marketFront: 'tcp://180.168.146.187:10131',
    authCode: '0000000000000000',
    userProductInfo: 'TauriApp',
    appId: 'simnow_client_test'
  },
  
  // 7x24小时环境
  simnow24: {
    name: 'SimNow 7x24小时',
    brokerId: '9999', 
    tradeFront: 'tcp://180.168.146.187:10201',
    marketFront: 'tcp://180.168.146.187:10211',
    authCode: '0000000000000000',
    userProductInfo: 'TauriApp',
    appId: 'simnow_client_test'
  },

  // 您当前使用的配置
  current: {
    name: '当前配置',
    brokerId: '9999',
    tradeFront: 'tcp://182.254.243.31:30001',
    marketFront: 'tcp://182.254.243.31:30011',
    authCode: '0000000000000000',
    userProductInfo: 'TauriApp',
    appId: 'simnow_client_test'
  },

  // 自定义配置
  custom: {
    name: '自定义配置',
    brokerId: '',
    tradeFront: '',
    marketFront: '',
    authCode: '0000000000000000',
    userProductInfo: 'TauriApp',
    appId: 'simnow_client_test'
  }
};

// 配置管理类
export class CtpConfigManager {
  private static readonly CONFIG_KEY = 'ctp_server_config';
  private static readonly SELECTED_SERVER_KEY = 'selected_ctp_server';

  // 获取当前选中的服务器配置
  static getCurrentServerConfig(): CtpServerConfig {
    const selectedServer = this.getSelectedServer();
    const config = CTP_SERVERS[selectedServer];
    
    if (!config) {
      console.warn(`未找到服务器配置: ${selectedServer}，使用默认配置`);
      return CTP_SERVERS.current;
    }

    // 如果是自定义配置，从本地存储获取
    if (selectedServer === 'custom') {
      const customConfig = this.getCustomConfig();
      return customConfig || CTP_SERVERS.custom;
    }

    return config;
  }

  // 获取选中的服务器标识
  static getSelectedServer(): string {
    try {
      return localStorage.getItem(this.SELECTED_SERVER_KEY) || 'current';
    } catch (error) {
      console.error('获取选中服务器失败:', error);
      return 'current';
    }
  }

  // 设置选中的服务器
  static setSelectedServer(serverKey: string): void {
    try {
      if (!CTP_SERVERS[serverKey]) {
        throw new Error(`无效的服务器配置: ${serverKey}`);
      }
      localStorage.setItem(this.SELECTED_SERVER_KEY, serverKey);
    } catch (error) {
      console.error('设置选中服务器失败:', error);
    }
  }

  // 获取自定义配置
  static getCustomConfig(): CtpServerConfig | null {
    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('获取自定义配置失败:', error);
    }
    return null;
  }

  // 保存自定义配置
  static saveCustomConfig(config: CtpServerConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('保存自定义配置失败:', error);
    }
  }

  // 获取所有可用的服务器配置
  static getAllServers(): Record<string, CtpServerConfig> {
    const customConfig = this.getCustomConfig();
    if (customConfig) {
      return {
        ...CTP_SERVERS,
        custom: customConfig
      };
    }
    return CTP_SERVERS;
  }

  // 验证配置是否完整
  static validateConfig(config: CtpServerConfig): string[] {
    const errors: string[] = [];
    
    if (!config.brokerId?.trim()) {
      errors.push('请输入期货公司代码');
    }
    
    if (!config.tradeFront?.trim()) {
      errors.push('请输入交易前置地址');
    }
    
    if (!config.marketFront?.trim()) {
      errors.push('请输入行情前置地址');
    }

    // 验证地址格式
    const frontRegex = /^tcp:\/\/[\d.]+:\d+$/;
    if (config.tradeFront && !frontRegex.test(config.tradeFront)) {
      errors.push('交易前置地址格式不正确，应为: tcp://ip:port');
    }
    
    if (config.marketFront && !frontRegex.test(config.marketFront)) {
      errors.push('行情前置地址格式不正确，应为: tcp://ip:port');
    }
    
    return errors;
  }

  // 测试连接配置
  static async testConnection(config: CtpServerConfig): Promise<boolean> {
    // 这里可以实现连接测试逻辑
    // 暂时返回true，实际应该调用CTP API进行连接测试
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }
}
