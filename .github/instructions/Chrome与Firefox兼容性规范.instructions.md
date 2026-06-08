---
description: "修改涉及浏览器差异的代码、manifest 文件、或扩展 API 调用时使用。涵盖 Chrome 与 Firefox 在 Manifest V3 下的关键差异及兼容处理。"
applyTo: ["manifest.chrome.json", "manifest.firefox.json", "background/*.js", "content/*.js"]
---

# Chrome 与 Firefox 兼容性规范

## 规则

### 1. Manifest 差异同步

修改涉及浏览器差异的代码时，必须同时在两个 manifest 中做对应变更。两个 manifest 都需要独立维护，不可共享。

### 2. 关键差异点对照

| 差异点 | Chrome | Firefox |
|--------|--------|---------|
| Background 声明 | `service_worker: "background/index.js"` | `scripts: [按序列出所有 JS]` |
| 打包方式 | 文件夹整体 zip | 文件夹内容 zip |
| 设置页打开 | `chrome.runtime.openOptionsPage()` | `chrome.tabs.create(optionsUrl)` |
| 扩展 ID URL 前缀 | `chrome-extension://` | `moz-extension://` |
| 主题锚点图标 CSS 路径 | 使用 `chrome-extension://` | 使用 `moz-extension://` |
| `browser_specific_settings` | 不需要 | 需要 `gecko.id` 和 `strict_min_version` |
| 文件 URL 访问 | 需用户手动开启 | 默认允许 |

### 3. Firefox Background 加载顺序

Firefox 的 `scripts` 数组必须按以下顺序声明（依赖顺序）：

1. Vendor 库（`markdown-it.min.js`、`marked.min.js`、`remark.min.js`）
2. 编译器模块（按字母或使用顺序）
3. 功能模块（`storage.js` → `webrequest.js` → `detect.js` → `inject.js` → `messages.js` → ...）
4. 入口文件（`index.js`）

### 4. 扩展 ID 前缀检测

当需要在前端代码中引用扩展内部资源时，使用运行时检测而非硬编码：

```javascript
var runtimeUrl = chrome.runtime.getURL('')
// runtimeUrl 会自动返回正确的 chrome-extension:// 或 moz-extension://
```

### 5. Firefox 特殊处理

- Firefox 的 `optional_permissions` 不支持 `host_permissions` 语法，需使用 `*://*/` 替代
- Firefox 的 content script 注入前需先发 `ping` 消息检测是否已注入（见 `background/detect.js`）
- Firefox 支持通过 `network.cookie.cookieBehavior` 设置控制第三方 cookie，影响 file:// URL 的 fetch 行为

## 参考

- Chrome manifest 见 `manifest.chrome.json`
- Firefox manifest 见 `manifest.firefox.json`
- 运行时检测见 `background/detect.js` 中的 `ping` 消息
