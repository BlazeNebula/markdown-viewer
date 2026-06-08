---
description: "创建或修改 content/、popup/、options/ 目录下使用 Mithril.js 框架的文件时使用。涵盖 Mithril 组件结构、生命周期、状态管理核心约定。"
applyTo: ["content/index.js", "popup/index.js", "options/index.js"]
---

# Mithril 组件开发规范

## 规则

### 1. 组件结构

使用 Mithril 的闭包组件模式（而非 Class 组件）：

```javascript
var Component = function() {
  var state = {}  // 组件私有状态

  return {
    oninit: function(vnode) { /* 初始化逻辑 */ },
    view: function(vnode) {  /* 返回 vnode 树 */ },
    onupdate: function(vnode) { /* DOM 更新后执行 */ }
  }
}
```

### 2. 渲染时序

在 `content/index.js` 的 `update()` 中，各特性按固定时序调用：

1. **恢复滚动位置** — 立即执行（`scroll.restore()`）
2. **Prism 语法高亮** — `setTimeout 20ms`（`prism()`）
3. **Mermaid 图表渲染** — `setTimeout 40ms`（`mermaid()`）
4. **MathJax 公式排版** — `setTimeout 60ms`（`mathjax()`）

### 3. 状态管理

- 组件状态使用闭包变量而非 `m.redraw` 驱动
- Background 的设置快照通过 `chrome.runtime.sendMessage` 获取
- Content Script 的初始状态通过 `args` 全局变量注入

### 4. DOM 操作

- Mithril 的 `oncreate` 用于初始化第三方库（如 MDC）
- 避免直接操作 DOM，优先通过 Mithril 的视图层管理

## 参考

- Content Script 主渲染逻辑见 `content/index.js`
- Popup 实现见 `popup/index.js`
- Options 页面实现见 `options/index.js`
