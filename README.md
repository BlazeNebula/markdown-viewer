
# Markdown Viewer / 浏览器扩展

**安装：[Chrome]** / **[Firefox]** / **[Edge]** / **[Opera]** / **[Brave]** / **[Chromium]** / **[Vivaldi]**

# 功能特点

- 安全至上设计
- 渲染本地和远程文件 URL
- 细粒度的远程源访问控制
- 多种 Markdown 解析器
- 全面控制编译器选项（[markdown-it]、[marked]、[remark]）
- 30+ 主题（[cleanrmd]、[GitHub][github-theme]）
- 支持自定义主题
- GitHub 风格 Markdown（GFM）
- 文件变更自动重新加载
- 语法高亮的代码块（[prism][prism]）
- 目录生成（ToC）
- MathJax 公式（[mathjax]）
- Mermaid 图表（[mermaid]）
- 转换 Emoji 简码（图标由 [EmojiOne][emojione] 免费提供）
- 记住滚动位置
- Markdown 内容类型检测
- 可配置的 Markdown 文件路径检测
- 设置同步
- 原始和渲染 Markdown 视图
- 免费且开源

# 目录

- **[安装后](#安装后)**
- **[主题](#主题)**
- **[编译器选项](#编译器选项)**
- **[内容选项](#内容选项)**
- **[管理源](#管理源)**
- **[语法示例](#语法示例)**

> 针对 [Firefox][firefox-docs] 的额外文档

# 安装后

## 本地文件

1. 导航到 `chrome://extensions`
2. 找到 Markdown Viewer 扩展，点击 `详细信息` 按钮

![img-extensions]

1. 确保 `允许访问文件 URL` 开关已打开

![img-file-access]

## 远程文件

1. 点击 Markdown Viewer 图标，选择 [高级选项](#管理源)
2. 添加您希望 Markdown Viewer 扩展允许访问的源

---

# 主题

所有主题均支持以下宽度选项：

- `auto` - 根据屏幕尺寸自动调整内容宽度
- `full` - 100% 屏幕宽度
- `wide` - 固定 1400px
- `large` - 固定 1200px
- `medium` - 固定 992px
- `small` - 固定 768px
- `tiny` - 固定 576px

`github` 和 `github-dark` 主题的 `auto` 选项具有固定宽度和周围边框，与 github.com 上仓库的 `README.md` 文件渲染效果相同

## 自定义主题

1. 进入高级选项并点击设置
2. 选择 `CUSTOM` 作为内容主题
3. 在下方上传您的自定义主题
4. 指定主题的配色方案

> 您的自定义主题会在上传时自动压缩，大小可达 8KB。

> 您可以在 Markdown 文档中添加 `<link rel="stylesheet" type="text/css" href="file:///home/me/custom-theme.css">` 以在开发主题时加快开发速度。自定义主题[示例][custom-theme]。

---

# 编译器选项

完整支持 **CommonMark**，包括 **GFM** 表格和删除线 **+**

| 选项           | 默认值    | 描述
| :-             | :-:       | :-
| **abbr**       | `false`   | 缩写，使用 `*[word]: Text` `<abbr>`
| **attr**       | `false`   | 自定义属性，使用 `{}` 花括号
| **breaks**     | `false`   | 将段落中的换行符 `\n` 转换为换行标签 `<br>`
| **cjk**        | `false`   | 抑制东亚字符之间的换行
| **deflist**    | `false`   | 定义列表 `<dl>`
| **footnote**   | `false`   | 脚注 `[^1]` `[^1]: a`
| **html**       | **`true`**| 允许在源中使用 HTML 标签
| **ins**        | `false`   | 插入文本 `++a++` `<ins>`
| **linkify**    | **`true`**| 自动将类似 URL 的文本转换为链接
| **mark**       | `false`   | 标记文本 `==a==` `<mark>`
| **sub**        | `false`   | 下标 `~a~` `<sub>`
| **sup**        | `false`   | 上标 `^a^` `<sup>`
| **tasklists**  | `false`   | 任务列表 `- [x]`
| **typographer**| `false`   | 启用一些语言中性的替换 + 引号美化
| **xhtmlOut**   | `false`   | 使用 `/` 关闭单标签（`<br />`）

---

# 内容选项

| 选项           | 默认值    | 描述
| :-             | :-:       | :-
| **autoreload** | `false`   | 文件变更时自动重新加载
| **emoji**      | `false`   | 将 emoji `:shortnames:` 转换为 EmojiOne 图片
| **mathjax**    | `false`   | 渲染 MathJax 公式
| **mermaid**    | `false`   | 渲染 Mermaid 图表
| **syntax**     | **`true`**| 语法高亮的围栏代码块
| **toc**        | `false`   | 生成目录

## 自动重新加载

启用后，扩展程序将每秒向以下位置的 Markdown 文件发送 GET 请求：

- `file:///` URL
- 任何解析为 localhost IPv4 `127.0.0.1` 或 IPv6 `::1` 的主机

## Emoji

将 emoji :shortnames: 转换为 EmojiOne 图片：

- 像 `:smile:` 这样的 Emoji 简码将使用 EmojiOne 图片转换为 :smile:
- 当前不支持 unicode 符号（如 `😄`）和 ASCII emoji（如 `:D`）

## MathJax

支持以下 MathJax 分隔符：

- 行内公式：`\(math\)` 和 `$math$`
- 显示公式：`\[math\]` 和 `$$math$$`

启用 MathJax 时，以下规则适用于您的 Markdown 内容：

- 文本中不属于数学公式的常规美元符号 `$` 需要进行转义：`\$`
- 不支持常规的 Markdown 圆括号转义：`\(` 和 `\)`，以及方括号转义：`\[` 和 `\]`。MathJax 会将这些分隔符之间的任何内容转换为数学公式，除非它们被包裹在反引号 `` `\(` `` 或围栏代码块中。

## Mermaid

渲染包裹在 `mmd` 或 `mermaid` 围栏代码块中的 Mermaid 图表：

    ```mmd
    sequenceDiagram
    ```

或者，图表也可以包裹在 HTML 标签中：

```html
<pre><code class="mermaid">
  sequenceDiagram
</code></pre>
```

- 通过向下或向上拖动代码块右下角来垂直调整图表容器大小
- 按住 Shift 键并使用鼠标滚轮进行缩放
- 按住鼠标左键并向任意方向拖动以平移

## 语法

围栏代码块的语法高亮：

    ```js
    var hello = 'hi'
    ```

或者，代码块也可以包裹在 HTML 标签中：

```html
<pre class="language-js"><code class="language-js">var hello = 'hi'</code></pre>
```

> 支持的语言及其对应[别名][prism-lang]的完整列表

## 目录

根据 Markdown 文档中的标题自动生成目录（ToC）。

---

# 管理源

点击 Markdown Viewer 图标，选择 `高级选项`。

默认情况下，Markdown Viewer 无法访问任何内容：

![img-no-access]

## 启用文件访问

要启用对文件 URL 的访问，请遵循[以下步骤](#本地文件)。

如果未启用对本地文件的访问，则文件访问标题旁边会显示一个额外的 `允许访问` 按钮：

![img-file-access-allow]

点击它将跳转到扩展的内置管理页面，您可以在其中切换 `允许访问文件 URL` 开关以启用它。

## 启用站点访问

可以通过将 URL 地址复制/粘贴到站点访问文本框中，然后点击旁边的 `添加` 按钮来启用对单个站点的访问：

![img-site-access-add]

> 可以通过使用通配符 `*://raw.githubusercontent.com` 同时启用 `http` 和 `https` 协议

> 可以通过使用通配符 `https://*.githubusercontent.com` 启用给定主机名的所有子域

> 可以通过添加 `http://localhost` 启用对 `localhost` 上所有端口的访问。
> 可以通过添加 `http://localhost:3000` 启用对特定端口的访问

## 允许所有站点

可以通过点击站点访问标题旁边的 `允许所有` 按钮来启用对**所有**站点的访问：

![img-site-allow-all]

> 这等同于在文本框中添加 `*://*` 模式

## 内容检测

每个启用的源都有内容类型标头检测和路径匹配正则表达式的选项：

![img-site-access-enabled]

### 标头检测

启用此选项后，扩展程序将检查是否存在值为 `text/markdown`、`text/x-markdown` 或 `text/plain` 的 `content-type` 标头。

### 路径匹配

启用此选项后，扩展程序将检查页面 URL 是否与路径匹配正则表达式匹配。

默认正则表达式为：`\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

这是一个简单的正则表达式，匹配以以下内容结尾的 URL：

- Markdown 文件扩展名：`\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)`
- 以及可选的哈希或查询字符串：`(?:#.*|\?.*)?`

> `(?:match)` 中的 `?:` 表示*非捕获组*，出于性能原因而使用。

您可以为每个启用的源修改路径匹配正则表达式。设置会在您输入时实时更新。

### 路径匹配优先级

启用的源按从最具体到最不具体的顺序匹配：

1. `https://raw.githubusercontent.com`
2. `https://*.githubusercontent.com`
3. `*://raw.githubusercontent.com`
4. `*://*.githubusercontent.com`
5. `*://*`

优先级最高的匹配源将被选中，其标头检测和路径匹配设置将用于确定是否应渲染内容。

> 建议仅明确允许您希望扩展程序访问的源。

## 删除源

点击要删除的源旁边的 `移除` 按钮。这将移除权限本身，使扩展程序无法再访问该源。

## 刷新源

如果您已登录浏览器并启用了同步功能，扩展程序将在您的所有设备之间同步您的偏好设置。允许的源列表也会同步。但是，您通过同意弹窗授予的实际权限无法同步。

如果您在某些设备上启用了新的源，则需要在其他设备上明确允许该源。在这种情况下，该源将高亮显示，并显示一个额外的 `刷新` 按钮：

![img-site-refresh]

只有需要刷新的源才会被高亮显示。除非您点击 `刷新` 按钮，否则扩展程序无法访问高亮显示的源。

> 在某些情况下，以前允许的源的访问权限可能会被禁用。请定期检查高级选项页面或重新加载它，并查找需要刷新的高亮源。

---

# 语法示例

有关 Markdown 语法以及 Markdown Viewer 所有功能的示例，请访问 [GitHub][syntax-github]、[GitLab][syntax-gitlab] 和 [BitBucket][syntax-bitbucket]：

- **elements.md** - Markdown 语法快速概览和 Markdown Viewer 功能总结
- **syntax.md** - 包含不同组合和边缘情况的大量 Markdown 语法示例
- **prism.md** - 语法高亮示例
- **mermaid.md** - 不同类型的 Mermaid 图表
- **mathjax.md** - MathJax 示例和支持文档

允许适当的远程源，或拉取上述任一仓库，并在本地通过 `file:///` 源访问它。

---

# 手动安装

以下说明适用于：Chrome、Edge、Opera、Brave、Chromium 和 Vivaldi。

请注意，在以下任何一种情况下，您都不会自动收到任何未来更新！

## 加载打包的 .crx

1. 前往[发布页面][releases]选择您想要安装的版本
2. 下载 `markdown-viewer.crx` 文件
3. 导航到 `chrome://extensions`
4. 将 `markdown-viewer.crx` 文件拖放到 `chrome://extensions` 页面

## 加载解压的 .zip

1. 前往[发布页面][releases]选择您想要安装的版本
2. 下载 `markdown-viewer.zip` 文件并解压
3. 导航到 `chrome://extensions`
4. 确保 `开发者模式` 开关已启用
5. 点击 `加载已解压的扩展程序` 按钮，然后选择解压的目录

## 构建

1. 克隆此仓库
2. 执行 `sh build/package.sh chrome`（或 `firefox` 以构建 Firefox 版本）
3. 导航到 `chrome://extensions`
4. 确保 `开发者模式` 开关已启用
5. 点击 `加载已解压的扩展程序` 按钮，然后选择克隆的目录

## Manifest v2

1. 克隆 [mv2] 或 [compilers-mv2] 分支（Markdown Viewer v4.0）
2. 导航到 `chrome://extensions`
3. 确保 `开发者模式` 开关已启用
4. 点击 `加载已解压的扩展程序` 按钮，然后选择克隆的目录

---

# 许可证

MIT 许可证（MIT）

版权所有（c）2013-至今，Simeon Velichkov <simeonvelichkov@gmail.com> (<https://github.com/simov/markdown-viewer>)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

  [chrome]: https://chromewebstore.google.com/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [firefox]: https://addons.mozilla.org/en-US/firefox/addon/markdown-viewer-chrome/
  [edge]: https://microsoftedge.microsoft.com/addons/detail/markdown-viewer/cgfmehpekedojlmjepoimbfcafopimdg
  [opera]: https://chromewebstore.google.com/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [brave]: https://chromewebstore.google.com/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [chromium]: https://chromewebstore.google.com/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [vivaldi]: https://chromewebstore.google.com/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk

  [marked]: https://github.com/markedjs/marked
  [remark]: https://github.com/remarkjs/remark
  [markdown-it]: https://github.com/markdown-it/markdown-it

  [emojione]: https://emojione.com
  [mathjax]: https://www.mathjax.org
  [mermaid]: https://mermaid.js.org
  [prism]: https://prismjs.com
  [github-theme]: https://github.com/sindresorhus/github-markdown-css
  [cleanrmd]: https://pkg.garrickadenbuie.com/cleanrmd/#themes

  [prism-lang]: https://prismjs.com/#supported-languages
  [releases]: https://github.com/simov/markdown-viewer/releases
  [mv2]: https://github.com/simov/markdown-viewer/tree/mv2
  [compilers-mv2]: https://github.com/simov/markdown-viewer/tree/compilers-mv2
  [firefox-docs]: https://github.com/simov/markdown-viewer/blob/main/firefox.md
  [custom-theme]: https://gist.github.com/simov/2a074a1c0123e6ba4bc2bfa6a67d3203

  [syntax-github]: https://github.com/simov/markdown-syntax
  [syntax-gitlab]: https://gitlab.com/simovelichkov/markdown-syntax
  [syntax-bitbucket]: https://bitbucket.org/simovelichkov/markdown-syntax

  [img-extensions]: https://i.imgur.com/kzullaI.png
  [img-file-access]: https://i.imgur.com/VVcPv0T.png
  [img-no-access]: https://i.imgur.com/U6mjgX0.png
  [img-file-access-allow]: https://i.imgur.com/2bStHeb.png
  [img-site-access-add]: https://i.imgur.com/CFg9JBt.png
  [img-site-allow-all]: https://i.imgur.com/MXZqFOB.png
  [img-site-access-enabled]: https://i.imgur.com/tFMzJ3l.png
  [img-site-refresh]: https://i.imgur.com/j0gATxT.png
