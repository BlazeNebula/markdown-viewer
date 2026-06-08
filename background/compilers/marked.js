
md.compilers.marked = (() => {
  var defaults = {
    breaks: false,
    gfm: true,
    pedantic: false,
    // plugins
    linkify: true,
    smartypants: false,
  }

  var description = {
    breaks: '启用 GFM 换行\n（需同时启用 gfm 选项）',
    gfm: '启用 GFM\n（GitHub Flavored Markdown）',
    pedantic: '不修复原始 markdown 的\nbug 或不规范行为',
    // plugins
    linkify: '自动将类 URL 文本转换为链接',
    smartypants: '使用“智能”排版标点\n用于引号和破折号等'
  }

  var ctor = ({ storage: { state } }) => ({
    defaults,
    description,
    compile: (markdown) =>
      new marked.marked(
        state.marked,
        marked.headings(),
        state.marked.linkify ? marked.linkify() : () => { },
        state.marked.smartypants ? marked.smartypants() : () => { },
      ).parse(markdown)
  })

  return Object.assign(ctor, { defaults, description })
})()
