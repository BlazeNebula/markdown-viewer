
md.compilers.commonmark = (() => {
  var defaults = {
    safe: false,
    smart: false,
  }

  var description = {
    safe: '不渲染原始 HTML',
    smart: [
      '直引号变为弯引号',
      '-- 变为 en dash',
      '--- 变为 em dash',
      '... 变为省略号'
    ].join('\n'),
  }

  var ctor = ({ storage: { state } }) => ({
    defaults,
    description,
    compile: (markdown) => ((
      reader = new commonmark.Parser(),
      writer = new commonmark.HtmlRenderer(state.commonmark)
    ) =>
      writer.render(reader.parse(markdown))
    )()
  })

  return Object.assign(ctor, { defaults, description })
})()
