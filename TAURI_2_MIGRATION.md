# Tauri 2.0 迁移指南：window.__TAURI__ 问题解决方案

## 问题描述

在使用 `npm run tauri dev` 编译生成的exe中，运行时发现 `window.__TAURI__` 属性不存在。这是从 Tauri 1.x 迁移到 Tauri 2.0 时的常见问题。

## 根本原因

### Tauri 2.0 的重要变化

1. **架构变化**：Tauri 2.0 不再自动注入全局的 `window.__TAURI__` 对象
2. **安全性改进**：采用了更严格的安全模型和权限系统
3. **API 导入方式变化**：推荐使用 ES 模块导入而不是全局对象访问

### 为什么 window.__TAURI__ 不再可用

- Tauri 2.0 移除了全局对象注入机制
- 新的架构更注重安全性和模块化
- 避免了全局命名空间污染

## 解决方案

### 1. 使用 ES 模块导入（推荐）

**旧方式（Tauri 1.x）：**
```javascript
// ❌ 不再工作
if (window.__TAURI__) {
  const result = await window.__TAURI__.invoke('my_command')
}
```

**新方式（Tauri 2.0）：**
```javascript
// ✅ 推荐方式
import { invoke } from '@tauri-apps/api/core'

try {
  const result = await invoke('my_command')
  // 成功调用说明在 Tauri 环境中
} catch (error) {
  // 调用失败，可能不在 Tauri 环境中
}
```

### 2. 环境检测的新方法

**旧方式：**
```javascript
// ❌ 不再可靠
const isTauri = typeof window.__TAURI__ !== 'undefined'
```

**新方式：**
```javascript
// ✅ 推荐方式
const checkTauriEnvironment = async () => {
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('get_api_version') // 测试调用
    return true // 在 Tauri 环境中
  } catch (error) {
    return false // 不在 Tauri 环境中
  }
}
```

### 3. 权限配置

确保在 `src-tauri/capabilities/default.json` 中配置了正确的权限：

```json
{
  "permissions": [
    "core:default",
    "core:app:default",
    "opener:default"
  ]
}
```

## 代码迁移示例

### 应用信息获取

**旧方式：**
```javascript
const version = window.__TAURI__.app.getVersion()
```

**新方式：**
```javascript
import { getVersion } from '@tauri-apps/api/app'
const version = await getVersion()
```

### 文件系统操作

**旧方式：**
```javascript
const content = await window.__TAURI__.fs.readTextFile('file.txt')
```

**新方式：**
```javascript
import { readTextFile } from '@tauri-apps/api/fs'
const content = await readTextFile('file.txt')
```

### 窗口操作

**旧方式：**
```javascript
await window.__TAURI__.window.getCurrent().setTitle('New Title')
```

**新方式：**
```javascript
import { getCurrentWindow } from '@tauri-apps/api/window'
await getCurrentWindow().setTitle('New Title')
```

## 测试和验证

1. **访问调试页面**：在应用中访问 `/tauri-debug` 路由
2. **检查环境检测**：查看是否正确检测到 Tauri 环境
3. **测试 API 调用**：验证各种 Tauri API 是否正常工作

## 最佳实践

1. **始终使用 ES 模块导入**：不要依赖全局对象
2. **错误处理**：总是包装 Tauri API 调用在 try-catch 中
3. **环境检测**：使用实际的 API 调用来检测 Tauri 环境
4. **权限配置**：确保配置了应用所需的所有权限

## 常见问题

### Q: 为什么我的应用在浏览器中工作但在 Tauri 中不工作？
A: 检查是否正确使用了 ES 模块导入，并确保权限配置正确。

### Q: 如何在开发和生产环境中都能正常工作？
A: 使用动态导入和错误处理，这样代码在两种环境中都能正常运行。

### Q: 是否还有其他方式检测 Tauri 环境？
A: 可以检查 `window.__TAURI_INTERNALS__` 但不推荐，最好使用 API 调用测试。

## 总结

Tauri 2.0 的变化虽然需要代码迁移，但带来了更好的安全性和模块化。通过使用 ES 模块导入和正确的错误处理，可以创建更健壮的应用程序。
