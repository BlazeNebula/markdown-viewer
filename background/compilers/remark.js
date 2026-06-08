
md.compilers.remark = (() => {
  var defaults = {
    breaks: false,
    gfm: true,
    sanitize: false,
  }

  var description = {
    breaks: '将段落内的换行符显示为换行',
    gfm: '切换 GFM（GitHub Flavored Markdown）',
    sanitize: '禁用 HTML 标签渲染',
  }

  var ctor = ({ storage: { state } }) => ({
    defaults,
    description,
    compile: (markdown) =>
      remark.remark()
        .use(remark.parse)
        .use(state.remark.gfm ? remark.gfm : undefined)
        .use(state.remark.breaks ? remark.breaks : undefined)
        .use(remark.stringify)
        .use(remark.slug)
        .use(remark.html, state.remark) // sanitize
        .processSync(markdown)
        .value
  })

  return Object.assign(ctor, { defaults, description })
})()
