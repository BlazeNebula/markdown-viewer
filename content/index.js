
var $ = document.querySelector.bind(document)

var state = {
  theme: args.theme,
  raw: args.raw,
  themes: args.themes,
  content: args.content,
  compiler: args.compiler,
  custom: args.custom,
  icon: args.icon,
  html: '',
  markdown: '',
  toc: '',
  reload: {
    interval: null,
    ms: 1000,
    md: false,
  },
  _themes: {
    'github': 'light',
    'github-dark': 'dark',
    'almond': 'light',
    // 'air': 'light',
    'awsm': 'light',
    'axist': 'light',
    'bamboo': 'auto',
    'bullframe': 'light',
    'holiday': 'auto',
    'kacit': 'light',
    'latex': 'light',
    'marx': 'light',
    'mini': 'light',
    'modest': 'light',
    'new': 'auto',
    'no-class': 'auto',
    'pico': 'auto',
    'retro': 'dark',
    'sakura': 'light',
    'sakura-vader': 'dark',
    'semantic': 'light',
    'simple': 'auto',
    // 'splendor': 'light',
    'style-sans': 'light',
    'style-serif': 'light',
    'stylize': 'light',
    'superstylin': 'auto',
    'tacit': 'light',
    'vanilla': 'auto',
    'water': 'light',
    'water-dark': 'dark',
    'writ': 'light',
    'custom': 'auto',
  }
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.message === 'reload') {
    location.reload(true)
  }
  else if (req.message === 'theme') {
    state.theme = req.theme
    m.redraw()
  }
  else if (req.message === 'themes') {
    state.themes = req.themes
    m.redraw()
  }
  else if (req.message === 'raw') {
    state.raw = req.raw
    state.reload.md = true
    m.redraw()
  }
  else if (req.message === 'autoreload') {
    clearInterval(state.reload.interval)
  }
})

var oncreate = {
  html: () => {
    update()
  }
}

var onupdate = {
  html: () => {
    if (state.reload.md) {
      state.reload.md = false
      update(true)
    }
  },
  theme: () => {
    if (state.content.mermaid) {
      setTimeout(() => mmd.render(), 0)
    }
  }
}

var update = (update) => {
  scroll(update)

  if (state.content.syntax) {
    setTimeout(() => Prism.highlightAll(), 20)
  }

  if (state.content.mermaid) {
    setTimeout(() => mmd.render(), 40)
  }

  if (state.content.mathjax) {
    setTimeout(() => mj.render(), 60)
  }
}

var render = (md) => {
  state.markdown = md
  chrome.runtime.sendMessage({
    message: 'markdown',
    compiler: state.compiler,
    markdown: frontmatter(state.markdown)
  }, (res) => {
    state.html = res.html
    if (state.content.emoji) {
      state.html = emojinator(state.html)
    }
    if (state.content.mermaid) {
      state.html = state.html.replace(
        /<code class="language-(?:mermaid|mmd)">/gi,
        '<code class="mermaid">'
      )
    }
    if (state.content.toc) {
      state.toc = toc.render(state.html)
    }
    state.html = anchors(state.html)
    m.redraw()
  })
}

function mount() {
  $('pre').style.display = 'none'
  var md = $('pre').innerText
  favicon()

  m.mount($('body'), {
    oninit: () => {
      render(md)
    },
    view: () => {
      var dom = []

      if (state.html) {
        state._themes.custom = state.custom.color

        var color =
          state._themes[state.theme] === 'dark' ||
            (state._themes[state.theme] === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'dark' : 'light'

        $('body').classList.remove(...Array.from($('body').classList).filter((name) => /^_theme|_color|_hierarchy/.test(name)))
        $('body').classList.add(`_theme-${state.theme}`, `_color-${color}`, '_hierarchy-line')

        // link/style 元素放在 wrapper 之外，避免样式重新计算干扰过渡动画
        dom.push(m('link#_theme', {
          onupdate: onupdate.theme,
          rel: 'stylesheet', type: 'text/css',
          href: state.theme !== 'custom' ? chrome.runtime.getURL(`/themes/${state.theme}.css`) : '',
        }))

        if (state.content.syntax) {
          dom.push(m('link#_prism', {
            rel: 'stylesheet', type: 'text/css',
            href: chrome.runtime.getURL(`/vendor/${color === 'dark' ? 'prism-okaidia' : 'prism'}.min.css`),
          }))
        }

        var widthClass = state.themes.width === 'auto' ? ' _width-auto' : ` _width-${state.themes.width}`
        var theme =
          (/github(-dark)?/.test(state.theme) ? 'markdown-body' : 'markdown-theme') +
          widthClass

        // 仅内容本身放入 wrapper，由 margin-left + width 过渡驱动
        var contentBody
        if (state.raw) {
          contentBody = state.content.syntax
            ? m('#_markdown', { oncreate: oncreate.html, onupdate: onupdate.html, class: theme },
              m.trust(`<pre class="language-md"><code class="language-md">${_escape(state.markdown)}</code></pre>`))
            : m('pre#_markdown', { oncreate: oncreate.html, onupdate: onupdate.html }, state.markdown)
        }
        else {
          contentBody = m('#_html', { oncreate: oncreate.html, onupdate: onupdate.html, class: theme },
            m.trust(state.html))
        }

        if (state.content.toc) {
          dom.push(m('#_toc.tex2jax-ignore', m.trust(state.toc)))
          // 更新 TOC 可见宽度 CSS 变量，供 _width-auto 实时自适应
          var updateTocWidth = function () {
            var collapsed = document.body.classList.contains('_toc-collapsed')
            var tocWidth = collapsed ? '0px' : '299px'
            document.body.style.setProperty('--toc-visible-width', tocWidth)
          }

          dom.push(m('button#_toc-toggle', {
            title: '切换目录',
            onclick: function () {
              document.body.classList.toggle('_toc-collapsed')
              updateTocWidth()
            }
          }, '\u2630'))

          dom.push(contentBody)
          if (state.theme === 'custom') {
            dom.push(m('style', { type: 'text/css' }, state.custom.theme))
          }

          state.raw ? $('body').classList.remove('_toc-left') : $('body').classList.add('_toc-left')

          // 初始计算 + 监听窗口缩放，实时更新 TOC 可见宽度
          updateTocWidth()
          window.addEventListener('resize', updateTocWidth)

          // 主题 CSS 加载后，将 body 的背景色同步到 TOC
          setTimeout(function () {
            var toc = document.querySelector('#_toc')
            var bg = getComputedStyle(document.body).backgroundColor
            if (toc && bg && bg !== 'transparent' && bg !== 'rgba(0,0,0,0)') {
              toc.style.backgroundColor = bg
            }
            // 读取 markdown 宽度，设定 CSS 变量用于比例计算
            var md = document.querySelector('#_html') || document.querySelector('#_markdown')
            if (md) {
              document.body.style.setProperty('--md-width', md.offsetWidth + 'px')
            }
          }, 150)
        }
        else {
          dom.push(contentBody)
          if (state.theme === 'custom') {
            dom.push(m('style', { type: 'text/css' }, state.custom.theme))
          }
        }
      }

      return dom
    }
  })
}

var anchors = (html) =>
  html.replace(/(<h[1-6] id="(.*?)">)/g, (header, _, id) =>
    header +
    '<a class="anchor" name="' + id + '" href="#' + id + '">' +
    '<span class="octicon octicon-link"></span></a>'
  )

var toc = (() => {
  var walk = (regex, string, group, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, group, result.concat(!group ? match[1] :
      group.reduce((all, name, index) => (all[name] = match[index + 1], all), {})))
  return {
    render: (html) =>
      walk(
        /<h([1-6]) id="(.*?)">(.*?)<\/h[1-6]>/gs,
        html,
        ['level', 'id', 'title']
      )
        .reduce((toc, { id, title, level }) => toc +=
          '<div class="_ul">'.repeat(level) +
          '<a href="#' + id + '">' + title.replace(/<a[^>]+>/g, '').replace(/<\/a>/g, '') + '</a>' +
          '</div>'.repeat(level)
          , '')
  }
})()

var frontmatter = (md) => {
  if (/^-{3}[\s\S]+?-{3}/.test(md)) {
    var [, yaml] = /^-{3}([\s\S]+?)-{3}/.exec(md)
    var title = /title: (?:'|")*(.*)(?:'|")*/.exec(yaml)
    title && (document.title = title[1])
  }
  else if (/^\+{3}[\s\S]+?\+{3}/.test(md)) {
    var [, toml] = /^\+{3}([\s\S]+?)\+{3}/.exec(md)
    var title = /title = (?:'|"|`)*(.*)(?:'|"|`)*/.exec(toml)
    title && (document.title = title[1])
  }
  return md.replace(/^(?:-|\+){3}[\s\S]+?(?:-|\+){3}/, '')
}

var favicon = () => {
  var favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.href = chrome.runtime.getURL(`/icons/${state.icon}/16x16.png`)
  $('head').appendChild(favicon)
}

var _escape = (str) =>
  str.replace(/[&<>]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[tag] || tag))

if (document.readyState === 'complete') {
  mount()
}
else {
  var timeout = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(timeout)
      mount()
    }
  }, 0)
}
