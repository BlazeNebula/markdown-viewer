
md.compilers.showdown = (() => {
  var defaults = null // see below

  var description = {
    disableForced4SpacesIndentedSublists: '关闭嵌套子列表必须缩进 4 空格的限制',
    encodeEmails: '将邮箱地址编码为 HTML 字符实体',
    ghCodeBlocks: '启用/禁用 GFM 围栏代码块',
    ghCompatibleHeaderId: '生成与 GitHub 兼容的标题 id（空格替换为短横线，移除特殊字符）',
    ghMentions: '启用 GitHub @提及',
    literalMidWordUnderscores: '将词中下划线按字面解析',
    noHeaderId: '启用/禁用自动生成标题 id',
    omitExtraWLInCodeBlocks: '省略代码块末尾多余的空白行',
    parseImgDimensions: '启用/禁用图片尺寸解析',
    prefixHeaderId: '指定生成的标题 id 前缀',
    requireSpaceBeforeHeadingText: '要求 `#` 与标题文本之间必须有空格（GFM 风格）',
    simpleLineBreaks: '将简单换行解析为 <br>（GFM 风格）',
    simplifiedAutoLink: '启用/禁用 GFM 自动链接风格',
    smartIndentationFix: '尝试智能修复 es6 字符串中的缩进',
    smoothLivePreview: '防止因不完整输入导致的实时预览异常',
    strikethrough: '启用/禁用删除线支持',
    tables: '启用/禁用表格支持',
    tablesHeaderId: '为表格标题添加 id',
    tasklists: '启用/禁用 GFM 任务列表支持',
    customizedHeaderId: '使用花括号内的文本作为标题 id',
    rawPrefixHeaderId: '禁止修改前缀',
    rawHeaderId: '仅移除生成标题 id 中的空格和引号',
    openLinksInNewWindow: '在新窗口打开所有链接',
    backslashEscapesHTMLTags: '支持 HTML 标签转义',
    emoji: '启用 emoji 支持',
    ellipsis: '将三个点替换为省略号 Unicode 字符',
    metadata: '启用文档元数据支持',
    splitAdjacentBlockquotes: '拆分相邻的块引用',
  }

  var flavor = (name) => {
    var options = showdown.getDefaultOptions()
    var flavor = showdown.getFlavorOptions(name)
    var result = {}
    for (var key in options) {
      result[key] = (flavor[key] !== undefined) ? flavor[key] : options[key]
    }
    return result
  }

  defaults = flavor('github')

  var ctor = ({ storage: { state } }) => ({
    defaults,
    description,
    compile: (markdown) =>
      new showdown.Converter(state.showdown)
        .makeHtml(markdown)
  })

  return Object.assign(ctor, { defaults, description })
})()
