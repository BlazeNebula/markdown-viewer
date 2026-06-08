# Markdown Viewer 浏览器扩展 — 工程约定

## 项目概览

这是一个 Manifest V3 浏览器扩展，用于在浏览器中直接渲染 Markdown 文件（支持 `file://` 和远程 HTTP(S) URL）。支持多编译器、多主题、Mermaid 图表、MathJax 公式、代码语法高亮、Emoji、目录生成、自动重新加载等功能。

- **上游原始仓库**：https://github.com/simov/markdown-viewer
- **当前目标**：基于上游 v5.3 进行二次改进开发

## 架构总览

```
background/          # Service Worker（核心逻辑：编译、检测、注入、消息路由）
  ├── index.js       # 入口：依赖注入初始化所有模块
  ├── storage.js     # chrome.storage.sync 读写 + 数据迁移
  ├── messages.js    # 消息路由中心
  ├── detect.js      # 标签页 Markdown 文件检测
  ├── inject.js      # Content Script + CSS 注入
  ├── webrequest.js  # 自动重载的 webRequest 监听
  ├── xhr.js         # file:// URL 的 fetch 封装
  ├── mathjax.js     # MathJax 分隔符 tokenize/detokenize
  ├── icon.js        # 扩展图标管理
  └── compilers/     # 6 种 Markdown 编译器适配
content/             # Content Script（注入到 Markdown 页面）
  ├── index.js       # Mithril 渲染主循环
  ├── index.css      # 基础样式
  ├── themes.css     # 各主题的 ToC 和锚点样式
  ├── scroll.js      # 滚动位置记忆
  ├── autoreload.js  # 文件变更自动重载
  ├── emoji.js       # Emoji 简码转图片
  ├── mathjax.js     # MathJax v3 配置
  ├── mermaid.js     # Mermaid 图表渲染
  └── prism.js       # Prism 代码高亮（动态加载语言）
options/             # 设置页面（Mithril + MDC + Bootstrap）
popup/               # 扩展弹窗（Mithril + MDC）
icons/               # 扩展图标（default/light/dark）
build/               # 构建系统（各依赖的打包脚本）
vendor/              # 构建产物：第三方库（gitignored）
themes/              # 构建产物：CSS 主题文件（gitignored）
```

## 构建和测试命令

```bash
# 为 Chrome 构建完整扩展包
sh build/package.sh chrome

# 为 Firefox 构建完整扩展包
sh build/package.sh firefox

# 构建单个依赖（如需单独调试）
sh build/markdown-it/build.sh
sh build/marked/build.sh
sh build/remark/build.sh
sh build/prism/build.sh   # Prism 语法高亮 + autoloader
sh build/mermaid/build.sh # Mermaid 图表 + CSP 修复
sh build/mdc/build.sh     # Material Design Components
sh build/themes/build.sh  # CSS 主题
```

## 代码约定

### 模块模式

所有后台模块使用 **依赖注入的 IIFE 模式**：每个模块是一个函数，接收依赖对象，挂载到全局 `md` 命名空间：

```javascript
// background/storage.js 示例
var md = md || {}
md.storage = function(md) {
  var state = {}
  return { defaults, state, set }
}
```

### 命名规则

| 用途 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `getState`, `notifyContent` |
| 构造函数/类 | PascalCase | 本项目中较少使用 |
| 常量 | UPPER_SNAKE_CASE | `ACCESSIBLE_URLS` |
| 文件名 | kebab-case | `markdown-it.js`, `webrequest.js` |
| 消息类型 | 点分命名空间 | `popup.theme`, `options.settings`, `origin.add` |

### 消息通信

所有组件间的通信通过 `chrome.runtime.onMessage` / `chrome.tabs.sendMessage` 进行，由 `background/messages.js` 统一路由：

- Content Script → Background：`markdown`（编译请求）、`autoreload`（获取最新内容）
- Popup → Background：`popup.*` 消息
- Options → Background：`options.*`、`origin.*`、`custom.*` 消息

### 编译器接口

每个编译器必须暴露统一接口：

```javascript
{
  defaults: {},            // 默认选项对象
  description: {},         // 每个选项的中文描述
  compile: (markdown) => string  // 编译函数
}
```

### 内容脚本渲染时序

在 `content/index.js` 的 `update()` 中，各特性的调用顺序：

1. 恢复滚动位置（立即）
2. Prism 语法高亮（20ms 后）
3. Mermaid 图表渲染（40ms 后）
4. MathJax 公式排版（60ms 后）

### Chrome vs Firefox 差异注意

| 差异点 | Chrome | Firefox |
|--------|--------|---------|
| Background 声明 | `service_worker`（单个 JS） | `scripts` 数组（按序加载） |
| 打包方式 | 文件夹整体 zip | 文件夹内容 zip |
| 设置页打开方式 | `chrome.runtime.openOptionsPage()` | `chrome.tabs.create(optionsUrl)` |
| 扩展 ID 前缀 | `chrome-extension://` | `moz-extension://` |
| 主题锚点图标 CSS URL | `chrome-extension://` | `moz-extension://` |
| `browser_specific_settings` | 无 | 需要 `gecko.id` |
| 文件 URL 访问 | 需用户手动开启 | 默认允许 |

修改涉及浏览器差异的代码时，必须同时在两个 manifest 中做对应变更。

### 存储系统

- 使用 `chrome.storage.sync`（跨设备同步）
- `storage.defaults()` 生成完整的默认设置（含各编译器的默认选项）
- `storage.state` 是运行时内存中的设置快照
- 版本迁移逻辑在 `storage.migrations()` 中，处理从 v3.6 到当前版本的所有迁移路径

## 语言规则

1. **终端/日志保留原文**：错误日志、命令行输出等保留原文，需要时在其下方提供简体中文解释
2. **正文用简体中文**：对话、解释、注释、文档、回复正文统一使用简体中文
3. **代码标识符保留英文**：变量名、函数名、类名、文件名保持英文原样
4. **技术名词**：API、JSON、HTTP 等术语可保留英文，首次出现可括号注中文
5. **代码注释用简体中文**：代码中的注释和文档字符串必须使用简体中文
