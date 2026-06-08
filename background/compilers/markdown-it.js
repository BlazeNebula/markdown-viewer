
var md = { compilers: {} }

md.compilers['markdown-it'] = (() => {
  var defaults = {
    breaks: true,
    html: true,
    linkify: true,
    typographer: false,
    xhtmlOut: true,
    langPrefix: 'language-',
    quotes: '\"\"\'\'',
    // plugins
    abbr: false,
    attrs: false,
    cjk: false,
    deflist: false,
    footnote: true,
    ins: false,
    mark: false,
    sub: false,
    sup: false,
    tasklists: false,
  }

  var description = {
    breaks: '将段落中的 \\n 转换为 <br> 换行',
    html: '允许在源码中使用 HTML 标签',
    linkify: '自动将类 URL 文本转换为链接',
    typographer: '启用语言无关的替换与引号美化',
    xhtmlOut: '使用 / 关闭单标签 (<br />)',
    // plugins
    abbr: '缩写 <abbr>\n*[word]: 说明',
    attrs: '自定义属性\n# header {#id}',
    cjk: '抑制东亚字符之间的换行',
    deflist: '定义列表 <dl>\n标题\n: 定义',
    footnote: '脚注\nword[^1]\n[^1]: 说明',
    ins: '插入文本 <ins>\n++text++',
    mark: '高亮文本 <mark>\n==text==',
    sub: '下标 <sub>\n~text~',
    sup: '上标 <sup>\n^text^',
    tasklists: '任务列表\n- [x]\n- [ ]',
  }

  var ctor = ({ storage: { state } }) => ({
    defaults,
    description,
    compile: (markdown) =>
      mdit.mdit(state['markdown-it'])
        .use(mdit.anchor, {
          slugify: (s) => new mdit.slugger().slug(s)
        })
        .use(state['markdown-it'].abbr ? mdit.abbr : () => { })
        .use(state['markdown-it'].attrs ? mdit.attrs : () => { })
        .use(state['markdown-it'].cjk ? mdit.cjk : () => { })
        .use(state['markdown-it'].deflist ? mdit.deflist : () => { })
        .use(state['markdown-it'].footnote ? mdit.footnote : () => { })
        .use(state['markdown-it'].ins ? mdit.ins : () => { })
        .use(state['markdown-it'].mark ? mdit.mark : () => { })
        .use(state['markdown-it'].sub ? mdit.sub : () => { })
        .use(state['markdown-it'].sup ? mdit.sup : () => { })
        .use(state['markdown-it'].tasklists ? mdit.tasklists : () => { })
        .render(markdown)
  })

  return Object.assign(ctor, { defaults, description })
})()
