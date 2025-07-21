// 环境配置管理
export interface EnvironmentConfig {
  name: string;
  description: string;
  ctpServers: {
    production: string[];
    simulation: string[];
    test: string[];
  };
  features: {
    enableDebug: boolean;
    enableLogging: boolean;
    enableMockData: boolean;
  };
}

// 环境配置定义
export const ENVIRONMENTS: Record<string, EnvironmentConfig> = {
  development: {
    name: '开发环境',
    description: '本地开发环境，启用调试功能',
    ctpServers: {
      production: [],
      simulation: [
        'tcp://180.168.146.187:10130', // SimNow 模拟交易
        'tcp://180.168.146.187:10131'  // SimNow 模拟行情
      ],
      test: [
        'tcp://182.254.243.31:30001',  // 您当前的测试服务器
        'tcp://182.254.243.31:30011'
      ]
    },
    features: {
      enableDebug: true,
      enableLogging: true,
      enableMockData: true
    }
  },

  testing: {
    name: '测试环境',
    description: '测试环境，用于功能验证',
    ctpServers: {
      production: [],
      simulation: [
        'tcp://180.168.146.187:10130',
        'tcp://180.168.146.187:10131'
      ],
      test: [
        'tcp://182.254.243.31:30001',
        'tcp://182.254.243.31:30011'
      ]
    },
    features: {
      enableDebug: true,
      enableLogging: true,
      enableMockData: false
    }
  },

  production: {
    name: '生产环境',
    description: '生产环境，连接真实交易服务器',
    ctpServers: {
      production: [
        // 这里应该配置真实的生产服务器地址
        // 'tcp://real-trade-server:port',
        // 'tcp://real-market-server:port'
      ],
      simulation: [
        'tcp://180.168.146.187:10130',
        'tcp://180.168.146.187:10131'
      ],
      test: []
    },
    features: {
      enableDebug: false,
      enableLogging: true,
      enableMockData: false
    }
  }
};

// 环境管理类
export class EnvironmentManager {
  private static readonly ENV_KEY = 'app_environment';
  private static readonly DEFAULT_ENV = 'development';

  // 获取当前环境
  static getCurrentEnvironment(): string {
    try {
      return localStorage.getItem(this.ENV_KEY) || this.DEFAULT_ENV;
    } catch (error) {
      console.error('获取当前环境失败:', error);
      return this.DEFAULT_ENV;
    }
  }

  // 设置当前环境
  static setCurrentEnvironment(env: string): void {
    try {
      if (!ENVIRONMENTS[env]) {
        throw new Error(`无效的环境配置: ${env}`);
      }
      localStorage.setItem(this.ENV_KEY, env);
    } catch (error) {
      console.error('设置当前环境失败:', error);
    }
  }

  // 获取当前环境配置
  static getCurrentConfig(): EnvironmentConfig {
    const currentEnv = this.getCurrentEnvironment();
    return ENVIRONMENTS[currentEnv] || ENVIRONMENTS[this.DEFAULT_ENV];
  }

  // 获取所有环境
  static getAllEnvironments(): Record<string, EnvironmentConfig> {
    return ENVIRONMENTS;
  }

  // 检查功能是否启用
  static isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    const config = this.getCurrentConfig();
    return config.features[feature];
  }

  // 获取CTP服务器列表
  static getCtpServers(type: keyof EnvironmentConfig['ctpServers']): string[] {
    const config = this.getCurrentConfig();
    return config.ctpServers[type] || [];
  }

  // 自动检测环境
  static autoDetectEnvironment(): string {
    // 检查是否在Tauri环境中
    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    
    // 检查URL或其他标识
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    
    if (hostname.includes('test') || hostname.includes('staging')) {
      return 'testing';
    }
    
    if (isTauri) {
      // 在Tauri应用中，可以根据构建配置判断
      return 'production';
    }
    
    return this.DEFAULT_ENV;
  }

  // 初始化环境
  static initializeEnvironment(): void {
    const currentEnv = this.getCurrentEnvironment();
    
    // 如果没有设置环境，自动检测
    if (currentEnv === this.DEFAULT_ENV) {
      const detectedEnv = this.autoDetectEnvironment();
      if (detectedEnv !== this.DEFAULT_ENV) {
        this.setCurrentEnvironment(detectedEnv);
      }
    }

    const config = this.getCurrentConfig();
    console.log(`🌍 当前环境: ${config.name} (${currentEnv})`);
    console.log(`📝 环境描述: ${config.description}`);
    console.log(`🔧 功能配置:`, config.features);
  }
}

// 导出便捷函数
export const isDebugEnabled = () => EnvironmentManager.isFeatureEnabled('enableDebug');
export const isLoggingEnabled = () => EnvironmentManager.isFeatureEnabled('enableLogging');
export const isMockDataEnabled = () => EnvironmentManager.isFeatureEnabled('enableMockData');

// 在模块加载时初始化环境
EnvironmentManager.initializeEnvironment();
