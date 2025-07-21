import { invoke } from '@tauri-apps/api/core';
import {
  CtpAccountConfig,
  ApiResponse,
  MarketDataRequest,
  OrderRequest,
  ConnectionStatus,
  LogEntry,
  LogLevel,
  MarketDataInfo,
  AccountInfo,
  PositionInfo
} from '../types/ctp';

// 检查是否在 Tauri 环境中 - 使用 Tauri 2.0 推荐的检测方式
async function isTauriEnvironment(): Promise<boolean> {
  try {
    // Tauri 2.0 推荐的检测方式：尝试导入 Tauri API
    const { invoke } = await import('@tauri-apps/api/core');

    // 如果能成功导入并调用，说明在 Tauri 环境中
    await invoke('get_api_version'); // 测试调用一个已知的命令
    return true;
  } catch (error) {
    // 如果导入失败或调用失败，可能不在 Tauri 环境中
    return false;
  }
}

// 安全的 invoke 函数
async function safeInvoke(command: string, args?: any): Promise<any> {
  const isTauri = await isTauriEnvironment();
  if (!isTauri) {
    throw new Error('Not running in Tauri environment. Please run the application through Tauri.');
  }

  try {
    return await invoke(command, args);
  } catch (error) {
    console.error(`Tauri invoke error for command "${command}":`, error);
    throw error;
  }
}

export class CtpService {
  private mdSessionId: string | null = null;
  private traderSessionId: string | null = null;
  private mdStatus: ConnectionStatus = 'disconnected' as ConnectionStatus;
  private traderStatus: ConnectionStatus = 'disconnected' as ConnectionStatus;
  private logs: LogEntry[] = [];
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initEventListeners();
  }

  // 获取安全的流文件路径
  private getFlowPath(type: 'md' | 'trader', sessionId: string): string {
    // 使用系统临时目录，避免影响项目文件监听
    // 在 Windows 上通常是 %TEMP%，在 Linux/Mac 上是 /tmp
    return `../temp/ctp_cache/${type}_${sessionId}`;
  }

  private initEventListeners() {
    // 初始化事件监听器
    this.eventListeners.set('md_status_change', []);
    this.eventListeners.set('trader_status_change', []);
    this.eventListeners.set('market_data', []);
    this.eventListeners.set('order_update', []);
    this.eventListeners.set('trade_update', []);
    this.eventListeners.set('log', []);
  }

  // 事件管理
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private addLog(message: string, level: LogLevel = LogLevel.Info, data?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    this.logs.unshift(logEntry);
    if (this.logs.length > 1000) {
      this.logs.pop();
    }
    this.emit('log', logEntry);
  }

  // 基础 API 方法
  async getApiVersion(): Promise<ApiResponse<string>> {
    try {
      const result = await safeInvoke('get_api_version') as ApiResponse<string>;
      this.addLog(`获取API版本: ${result.success ? '成功' : '失败'}`, 
        result.success ? LogLevel.Info : LogLevel.Error, result);
      return result;
    } catch (error) {
      this.addLog(`获取API版本异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  // 行情 API 方法
  async createMdApi(flowPath?: string): Promise<ApiResponse<string>> {
    try {
      const sessionId = `md_${Date.now()}`;
      const safePath = flowPath || this.getFlowPath('md', sessionId);

      this.addLog(`创建行情API，流文件路径: ${safePath}`, LogLevel.Info);

      const result = await safeInvoke('create_md_api', {
        sessionId,
        flowPath: safePath,
        isUsingUdp: false,
        isMulticast: false
      }) as ApiResponse<string>;

      if (result.success) {
        this.mdSessionId = sessionId;
        this.mdStatus = 'connected' as ConnectionStatus;
        this.emit('md_status_change', this.mdStatus);
        this.addLog(`创建行情API成功: ${sessionId}`, LogLevel.Info);
      } else {
        this.addLog(`创建行情API失败: ${result.error}`, LogLevel.Error, result);
      }
      return result;
    } catch (error) {
      this.addLog(`创建行情API异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  async releaseMdApi(): Promise<ApiResponse<string>> {
    if (!this.mdSessionId) {
      const error = '没有活跃的行情API会话';
      this.addLog(error, LogLevel.Warning);
      return { success: false, error };
    }

    try {
      this.addLog(`释放行情API: ${this.mdSessionId}`, LogLevel.Info);

      const result = await safeInvoke('release_md_api', {
        sessionId: this.mdSessionId
      }) as ApiResponse<string>;

      if (result.success) {
        this.addLog(`行情API释放成功: ${this.mdSessionId}`, LogLevel.Info);
        this.mdSessionId = null;
        this.mdStatus = 'disconnected' as ConnectionStatus;
        this.emit('md_status_change', this.mdStatus);
      } else {
        this.addLog(`行情API释放失败: ${result.error}`, LogLevel.Error, result);
      }
      return result;
    } catch (error) {
      this.addLog(`释放行情API异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  async mdLogin(config: CtpAccountConfig): Promise<ApiResponse<string>> {
    if (!this.mdSessionId) {
      const error = '请先创建行情API';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    try {
      this.mdStatus = 'connecting' as ConnectionStatus;
      this.emit('md_status_change', this.mdStatus);

      this.addLog(`开始行情登录: ${config.md_front}`, LogLevel.Info);

      const result = await safeInvoke('md_login', {
        sessionId: this.mdSessionId,
        config
      }) as ApiResponse<string>;

      if (result.success) {
        // 注意：MD登录是异步过程，这里只是启动了登录流程
        // 实际的登录状态需要通过回调来确认
        this.mdStatus = 'login_success' as ConnectionStatus;
        this.addLog('行情登录流程已启动', LogLevel.Info);
        this.addLog(`登录信息: ${result.data}`, LogLevel.Info);

        // 给一些时间让连接建立
        await new Promise(resolve => setTimeout(resolve, 2000));

      } else {
        this.mdStatus = 'login_failed' as ConnectionStatus;
        this.addLog(`行情登录失败: ${result.error}`, LogLevel.Error, result);
      }

      this.emit('md_status_change', this.mdStatus);
      return result;
    } catch (error) {
      this.mdStatus = 'error' as ConnectionStatus;
      this.emit('md_status_change', this.mdStatus);
      this.addLog(`行情登录异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  async subscribeMarketData(instrumentIds: string[]): Promise<ApiResponse<string>> {
    if (!this.mdSessionId) {
      const error = '请先创建行情API';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    try {
      const request: MarketDataRequest = { instrument_ids: instrumentIds };
      const result = await safeInvoke('subscribe_market_data', {
        sessionId: this.mdSessionId,
        request
      }) as ApiResponse<string>;

      if (result.success) {
        this.addLog(`订阅行情成功: ${instrumentIds.join(', ')}`, LogLevel.Info);
      } else {
        this.addLog(`订阅行情失败: ${result.error}`, LogLevel.Error, result);
      }
      return result;
    } catch (error) {
      this.addLog(`订阅行情异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  async unsubscribeMarketData(instrumentIds: string[]): Promise<ApiResponse<string>> {
    if (!this.mdSessionId) {
      const error = '请先创建行情API';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    try {
      const request: MarketDataRequest = { instrument_ids: instrumentIds };
      const result = await safeInvoke('unsubscribe_market_data', {
        sessionId: this.mdSessionId,
        request
      }) as ApiResponse<string>;

      if (result.success) {
        this.addLog(`取消订阅成功: ${instrumentIds.join(', ')}`, LogLevel.Info);
      } else {
        this.addLog(`取消订阅失败: ${result.error}`, LogLevel.Error, result);
      }
      return result;
    } catch (error) {
      this.addLog(`取消订阅异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  // 交易 API 方法
  async createTraderApi(flowPath?: string): Promise<ApiResponse<string>> {
    try {
      const sessionId = `trader_${Date.now()}`;
      const safePath = flowPath || this.getFlowPath('trader', sessionId);

      this.addLog(`创建交易API，流文件路径: ${safePath}`, LogLevel.Info);

      const result = await safeInvoke('create_trader_api', {
        sessionId,
        flowPath: safePath,
        encrypt: false
      }) as ApiResponse<string>;

      if (result.success) {
        this.traderSessionId = sessionId;
        this.traderStatus = 'connected' as ConnectionStatus;
        this.emit('trader_status_change', this.traderStatus);
        this.addLog(`创建交易API成功: ${sessionId}`, LogLevel.Info);
      } else {
        this.addLog(`创建交易API失败: ${result.error}`, LogLevel.Error, result);
      }
      return result;
    } catch (error) {
      this.addLog(`创建交易API异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  async traderLogin(config: CtpAccountConfig): Promise<ApiResponse<string>> {
    if (!this.traderSessionId) {
      const error = '请先创建交易API';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    try {
      this.traderStatus = 'connecting' as ConnectionStatus;
      this.emit('trader_status_change', this.traderStatus);

      const result = await safeInvoke('trader_login', {
        sessionId: this.traderSessionId,
        config
      }) as ApiResponse<string>;

      if (result.success) {
        this.traderStatus = 'login_success' as ConnectionStatus;
        this.addLog('交易登录成功', LogLevel.Info);
      } else {
        this.traderStatus = 'login_failed' as ConnectionStatus;
        this.addLog(`交易登录失败: ${result.error}`, LogLevel.Error, result);
      }
      
      this.emit('trader_status_change', this.traderStatus);
      return result;
    } catch (error) {
      this.traderStatus = 'error' as ConnectionStatus;
      this.emit('trader_status_change', this.traderStatus);
      this.addLog(`交易登录异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  async insertOrder(order: OrderRequest): Promise<ApiResponse<string>> {
    if (!this.traderSessionId) {
      const error = '请先创建交易API';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    try {
      const result = await safeInvoke('insert_order', {
        sessionId: this.traderSessionId,
        order
      }) as ApiResponse<string>;

      if (result.success) {
        this.addLog(`下单成功: ${order.instrument_id} ${order.direction === '0' ? '买入' : '卖出'} ${order.volume}手 @${order.price}`, LogLevel.Info);
      } else {
        this.addLog(`下单失败: ${result.error}`, LogLevel.Error, result);
      }
      return result;
    } catch (error) {
      this.addLog(`下单异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  async cancelOrder(orderRef: string): Promise<ApiResponse<string>> {
    if (!this.traderSessionId) {
      const error = '请先创建交易API';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    try {
      const result = await safeInvoke('cancel_order', {
        sessionId: this.traderSessionId,
        orderRef
      }) as ApiResponse<string>;

      if (result.success) {
        this.addLog(`撤单成功: ${orderRef}`, LogLevel.Info);
      } else {
        this.addLog(`撤单失败: ${result.error}`, LogLevel.Error, result);
      }
      return result;
    } catch (error) {
      this.addLog(`撤单异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  // 查询账户资金
  async queryAccount(): Promise<ApiResponse<AccountInfo>> {
    if (!this.traderSessionId) {
      const error = '请先创建交易API';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    if (this.traderStatus !== 'login_success') {
      const error = '交易API未登录';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    try {
      this.addLog('查询账户资金信息', LogLevel.Info);

      const result = await safeInvoke('query_account', {
        sessionId: this.traderSessionId
      }) as ApiResponse<AccountInfo>;

      if (result.success) {
        this.addLog('账户资金查询成功', LogLevel.Info);
        this.addLog(`可用资金: ${result.data?.available || 0}`, LogLevel.Info);
      } else {
        this.addLog(`账户资金查询失败: ${result.error}`, LogLevel.Error, result);
      }

      return result;
    } catch (error) {
      this.addLog(`账户资金查询异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  // 查询持仓信息
  async queryPosition(): Promise<ApiResponse<PositionInfo[]>> {
    if (!this.traderSessionId) {
      const error = '请先创建交易API';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    if (this.traderStatus !== 'login_success') {
      const error = '交易API未登录';
      this.addLog(error, LogLevel.Error);
      return { success: false, error };
    }

    try {
      this.addLog('查询持仓信息', LogLevel.Info);

      const result = await safeInvoke('query_position', {
        sessionId: this.traderSessionId
      }) as ApiResponse<PositionInfo[]>;

      if (result.success) {
        const positions = result.data || [];
        this.addLog(`持仓查询成功，共 ${positions.length} 个持仓`, LogLevel.Info);

        // 记录主要持仓信息
        positions.forEach(pos => {
          this.addLog(`持仓: ${pos.instrument_id} ${pos.posi_direction === '2' ? '多' : '空'} ${pos.position}手`, LogLevel.Info);
        });
      } else {
        this.addLog(`持仓查询失败: ${result.error}`, LogLevel.Error, result);
      }

      return result;
    } catch (error) {
      this.addLog(`持仓查询异常: ${error}`, LogLevel.Error, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  // 状态获取方法
  getMdStatus(): ConnectionStatus {
    return this.mdStatus;
  }

  getTraderStatus(): ConnectionStatus {
    return this.traderStatus;
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getMdSessionId(): string | null {
    return this.mdSessionId;
  }

  getTraderSessionId(): string | null {
    return this.traderSessionId;
  }

  // 清理方法
  async cleanup() {
    // 释放行情API
    if (this.mdSessionId) {
      try {
        await this.releaseMdApi();
      } catch (error) {
        console.error('Failed to release MD API during cleanup:', error);
      }
    }

    // 清理其他资源
    this.eventListeners.clear();
    this.logs = [];
    this.mdSessionId = null;
    this.traderSessionId = null;
    this.mdStatus = 'disconnected' as ConnectionStatus;
    this.traderStatus = 'disconnected' as ConnectionStatus;
  }
}

// 创建单例实例
export const ctpService = new CtpService();
