
# Change Log

## v5.6 - 2026-06-08

### 修复

- **Mermaid 标签换行终于生效**：切换到 `htmlLabels: false`（SVG 文本模式），
  Mermaid 通过 `nonMarkdownToLines()` 将 `<br>` / `\n` 分割为 `<tspan>` 元素实现换行
- **手动解码 HTML 实体**：在 `mermaid.run()` 之前将 `<code>` 内容中的
  `&lt;br&gt;` 手动替换为 `<br/>`，绕过 Mermaid 内部 `entityDecode()`
  在 content script 隔离环境中的不可靠行为
- 升级 `build/markdown-it/` 依赖：markdown-it 13.0.1 → 14.2.0 及所有配套插件到最新版

## v5.5 - 2026-06-08

### 新增

- Mermaid 图表缩放控制栏（− / 百分比 / + / ⟲ 重置），每个图表独立浮动工具条
  - 控制栏放在 mermaid-wrapper 中，避免被 Panzoom 的 overflow:hidden 裁剪
- 显式设置 Panzoom maxScale: 100（移除默认 400% 上限），minScale: 0.2

### 修复

- 恢复使用 mermaid.run() 替代 mermaid.render() 重构方案，解决整个页面空白的回归问题
- content/index.css 新增控制栏样式
- content/mermaid.js 整合控制栏创建

## v5.4 - 2026-06-08

- upgrade mermaid from v10.8.0 to v11.15.0
- migrate mermaid rendering from deprecated init() to run() API
- add one-click build script (scripts/构建扩展.ps1)
- add Copilot customization files (.github/)
- fix build temp files cleanup

## v5.3 - 2024-04-30

- custom theme support
- syntax highlighted raw markdown view
- pan, zoom and resize mermaid diagrams
- improved settings page
- fix frontmatter being stripped in raw markdown view
- fix anchor icon missing on origins with strict csp
- fix emoji rendered in prism code blocks
- update mermaid from v10.4.0 to v10.8.0
- update marked from v9.0.3 to v12.0.1

## v5.2 - 2023-09-26

- add markdown-it as default compiler
- add support for markdown extended syntax
- fix auto scroll on very large pages
- fix detect wildcard subdomains in origin
- fix allow port in origin
- theme fixes
- new default icon with an overlay
- update mermaid from v9.4.0 to v10.4.0
- update marked from v4 to v9

## v5.1 - 2023-03-14

- new advanced options page for managing the enabled origins
- each enabled origin now can have its own header and path detection setup
- the header detection now includes the text/plain content type
- header and path detection are now being applied together instead of one or the other
- on hard reload automatically scroll to hash fragment or last known position
- add missing tex/latex extensions for mathjax
- strip yaml/toml frontmatter and use the title variable to set the page title
- add favicon to markdown content pages
- dark mode for the popup and the options page
- bundle all prism languages and load them on demand
- fix emoji regex to exclude html tags and code blocks
- fix toc regex picking up header links
- fix default github theme to be always light
- print style fixes and other theme fixes
- update marked from v4.1.1 to v4.2.5
- update mermaid from v9.2.2 to v9.4.0
- update github theme from v5.1.0 to v5.2.0

## v5.0 - 2022-12-05

- migrate to manifest v3
- update mathjax from v2 to v3
- update mermaid from v8 to v9
- update marked from v1 to v4
- update remark from v13 to v14
- update prism syntax support
- add 30 new themes + update github themes
- add dark theme support for prism and mermaid
- add content width option
- update table of content styles to match theme
- expose syntax highlighting option
- add hot autoreloading
- add light icon option for dark browser theme
- disabling CSP is no longer possible
- customizing the page encoding is no longer possible

## v4.0 - 2020-12-24

- add mermaid diagrams support
- fix autoscroll in Chrome 87
- update marked, remark and prism
- update github theme
- initial Edge release

## v3.9 - 2020-02-23

- fix autoreload for file urls in Chrome 80

## v3.8 - 2020-01-05

- remember ToC scroll position

## v3.7 - 2019-09-01

- fixed incompatibility issue with other extensions
- fix file:// URLs on 'Block third-party cookies' enabled
- update marked, remark and prism
- update github theme

## v3.6 - 2018-07-07

- add autoreload content option
- improve origin detection
- show refresh button only on origins that need refreshing

## v3.5 - 2018-04-16

- add csp option for each origin individually
- add encoding option for each origin individually
- improve content-type header detection for Firefox

## v3.4 - 2018-01-12

- Firefox fixes

## v3.3 - 2017-11-22

- patch content-type header in Firefox

## v3.2 - 2017-10-30

- add mathjax support
- migrate the UI to Material Components (MDC)
- update remark compiler
- update github theme
- initial Firefox release

## v3.1 - 2017-04-28

- add content-type header detection
- add allow all origins button

## v3.0 - 2017-04-17

- improve scroll logic
- migrate to browser action
- add emoji support

## v2.9 - 2017-04-01

- add remark compiler

## v2.8 - 2017-03-29

- update compiler options tab

## v2.7 - 2017-03-12

- update github theme

## v2.6 - 2017-01-26

- add table of content (ToC)
- add content options tab
- expose remember scroll position as option
- update default path matching regex
- update github-dark theme

## v2.5 - 2017-01-23

- store scroll position for each path individually
- add tabs to the extension popup

## v2.4 - 2017-01-02

- load file urls dynamically
- fix anchor links

## v2.3 - 2016-10-30

- migrate to optional permissions
- render based on manually allowed remote origins
- add advanced options page to manage origins
- overhaul the UI using Material Design (MDL)

## v2.2 - 2016-09-25

- improve rendering time
- update github theme

## v2.1 - 2016-09-13

- add getcomposer.org to the list of excluded domains

## v2.0 - 2016-07-02

- migrate the content script logic to mithril
- update themes

## v1.8 - 2016-01-01

- update marked
- update github theme

## v1.7 - 2015-07-17

- exclude bitbucket.org and gitlab.com from .md matching
- match urls ending with anchor when showing the page action button

## v1.6 - 2015-04-21

- update github theme
- update prism

## v1.5 - 2014-10-19

- update github theme

## v1.4 - 2014-08-20

- update github theme

## v1.3 - 2014-07-31

- fix scroll position on remote origins

## v1.2 - 2014-07-26

- remember scroll position

## v1.1 - 2014-04-21

- css theme fix

## v1.0 - 2014-04-09

- render using marked compiler
- raw markdown / rendered html toggle button
- themes including a github one
- compiler options
- initial Chrome release
