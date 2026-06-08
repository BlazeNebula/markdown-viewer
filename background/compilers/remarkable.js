
md.compilers.remarkable = (() => {
  var defaults = {
    breaks: false,
    html: true,
    linkify: true,
    typographer: false,
    xhtmlOut: false,
    langPrefix: 'language-',
    quotes: '“”‘’'
  }

  var description = {
    breaks: '将段落中的 \\n 转换为 <br> 换行',
    html: '允许在源码中使用 HTML 标签',
    linkify: '自动将类 URL 文本转换为链接',
    typographer: '启用语言无关的替换与引号美化',
    xhtmlOut: '使用 / 关闭单标签 (<br />)'
  }

  var ctor = ({ storage: { state } }) => ({
    defaults,
    description,
    compile: (markdown) =>
      new Remarkable('full', state.remarkable)
        .render(markdown)
  })

  return Object.assign(ctor, { defaults, description })
})()
