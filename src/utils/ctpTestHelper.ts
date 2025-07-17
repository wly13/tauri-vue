// CTP测试辅助工具
import { CtpService } from '../services/ctpService';
import { UserStorageService } from '../services/userStorage';
import { ConnectionStatus, LogLevel } from '../types/ctp';

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

export class CtpTestHelper {
  private ctpService: CtpService;
  private testResults: TestResult[] = [];

  constructor() {
    this.ctpService = new CtpService();
  }

  // 运行完整的CTP连接测试
  async runFullTest(): Promise<TestResult[]> {
    this.testResults = [];
    
    console.log('开始CTP连接测试...');
    
    // 1. 测试API版本获取
    await this.testApiVersion();
    
    // 2. 测试行情API创建
    await this.testCreateMdApi();
    
    // 3. 测试交易API创建
    await this.testCreateTraderApi();
    
    // 4. 测试配置转换
    await this.testConfigConversion();
    
    // 5. 测试用户存储
    await this.testUserStorage();
    
    return this.testResults;
  }

  // 测试API版本获取
  private async testApiVersion(): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await this.ctpService.getApiVersion();
      const duration = Date.now() - startTime;
      
      if (result.success && result.data) {
        this.addTestResult({
          success: true,
          message: `API版本获取成功: ${result.data}`,
          duration,
          details: result
        });
      } else {
        this.addTestResult({
          success: false,
          message: `API版本获取失败: ${result.error}`,
          duration,
          details: result
        });
      }
    } catch (error) {
      this.addTestResult({
        success: false,
        message: `API版本获取异常: ${error}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 测试行情API创建
  private async testCreateMdApi(): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await this.ctpService.createMdApi();
      const duration = Date.now() - startTime;
      
      if (result.success) {
        this.addTestResult({
          success: true,
          message: '行情API创建成功',
          duration,
          details: result
        });
      } else {
        this.addTestResult({
          success: false,
          message: `行情API创建失败: ${result.error}`,
          duration,
          details: result
        });
      }
    } catch (error) {
      this.addTestResult({
        success: false,
        message: `行情API创建异常: ${error}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 测试交易API创建
  private async testCreateTraderApi(): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await this.ctpService.createTraderApi();
      const duration = Date.now() - startTime;
      
      if (result.success) {
        this.addTestResult({
          success: true,
          message: '交易API创建成功',
          duration,
          details: result
        });
      } else {
        this.addTestResult({
          success: false,
          message: `交易API创建失败: ${result.error}`,
          duration,
          details: result
        });
      }
    } catch (error) {
      this.addTestResult({
        success: false,
        message: `交易API创建异常: ${error}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 测试配置转换
  private async testConfigConversion(): Promise<void> {
    const startTime = Date.now();
    try {
      const userInfo = {
        account: 'test_account',
        password: 'test_password',
        server: 'ctp',
        isRemembered: false
      };
      
      const ctpConfig = UserStorageService.toCtpConfig(userInfo);
      const duration = Date.now() - startTime;
      
      // 验证配置字段
      const requiredFields = ['broker_id', 'account', 'password', 'trade_front', 'md_front'];
      const missingFields = requiredFields.filter(field => !ctpConfig[field as keyof typeof ctpConfig]);
      
      if (missingFields.length === 0) {
        this.addTestResult({
          success: true,
          message: '配置转换成功',
          duration,
          details: {
            broker_id: ctpConfig.broker_id,
            trade_front: ctpConfig.trade_front,
            md_front: ctpConfig.md_front
          }
        });
      } else {
        this.addTestResult({
          success: false,
          message: `配置转换失败，缺少字段: ${missingFields.join(', ')}`,
          duration,
          details: ctpConfig
        });
      }
    } catch (error) {
      this.addTestResult({
        success: false,
        message: `配置转换异常: ${error}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 测试用户存储
  private async testUserStorage(): Promise<void> {
    const startTime = Date.now();
    try {
      const testUserInfo = {
        account: 'test_user',
        password: 'test_pass',
        server: 'ctp',
        isRemembered: true,
        lastLoginTime: new Date().toISOString()
      };
      
      // 保存用户信息
      UserStorageService.saveUserInfo(testUserInfo);
      
      // 读取用户信息
      const savedInfo = UserStorageService.getUserInfo();
      
      // 清除测试数据
      UserStorageService.clearUserInfo();
      
      const duration = Date.now() - startTime;
      
      if (savedInfo && savedInfo.account === testUserInfo.account) {
        this.addTestResult({
          success: true,
          message: '用户存储测试成功',
          duration,
          details: { saved: testUserInfo, retrieved: savedInfo }
        });
      } else {
        this.addTestResult({
          success: false,
          message: '用户存储测试失败，数据不匹配',
          duration,
          details: { saved: testUserInfo, retrieved: savedInfo }
        });
      }
    } catch (error) {
      this.addTestResult({
        success: false,
        message: `用户存储测试异常: ${error}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 添加测试结果
  private addTestResult(result: TestResult): void {
    this.testResults.push(result);
    console.log(`[${result.success ? 'PASS' : 'FAIL'}] ${result.message}`);
    if (result.duration) {
      console.log(`  耗时: ${result.duration}ms`);
    }
    if (!result.success && result.details) {
      console.log('  详情:', result.details);
    }
  }

  // 获取测试摘要
  getTestSummary(): { total: number; passed: number; failed: number; passRate: string } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = total - passed;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%';
    
    return { total, passed, failed, passRate };
  }

  // 获取失败的测试
  getFailedTests(): TestResult[] {
    return this.testResults.filter(r => !r.success);
  }

  // 监听CTP服务事件
  setupEventListeners(): void {
    this.ctpService.on('md_status_change', (status: ConnectionStatus) => {
      console.log('行情状态变化:', status);
    });
    
    this.ctpService.on('trader_status_change', (status: ConnectionStatus) => {
      console.log('交易状态变化:', status);
    });
    
    this.ctpService.on('log', (log: any) => {
      console.log(`[${log.level.toUpperCase()}] ${log.message}`);
    });
  }
}

// 导出便捷函数
export async function runQuickTest(): Promise<void> {
  const tester = new CtpTestHelper();
  tester.setupEventListeners();
  
  const results = await tester.runFullTest();
  const summary = tester.getTestSummary();
  
  console.log('\n=== 测试摘要 ===');
  console.log(`总计: ${summary.total}, 通过: ${summary.passed}, 失败: ${summary.failed}, 通过率: ${summary.passRate}`);
  
  const failedTests = tester.getFailedTests();
  if (failedTests.length > 0) {
    console.log('\n=== 失败的测试 ===');
    failedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.message}`);
      if (test.details) {
        console.log('   详情:', test.details);
      }
    });
  }
}
