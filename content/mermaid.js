
var mmd = (() => {
  var watchInterval = null
  var loaded = false

  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  var decodeEntities = (html) => html
    .replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')

  var initPanzoom = () => {
    var diagrams = Array.from(document.querySelectorAll('code.mermaid'))
    if (watchInterval) clearInterval(watchInterval)
    watchInterval = setInterval(() => {
      var svg = Array.from(document.querySelectorAll('pre code.mermaid svg'))
      if (diagrams.length === svg.length) {
        clearInterval(watchInterval)
        watchInterval = null
        svg.forEach((diagram) => {
          var panzoom = Panzoom(diagram, { canvas: true, minScale: 0.2, maxScale: 100 })

          var pre = diagram.parentElement.parentElement
          pre.addEventListener('wheel', (e) => {
            if (!e.shiftKey) return
            panzoom.zoomWithWheel(e)
          })

          // 给 pre 包一层 div.mermaid-wrapper，以便放置控制栏
          var wrapper = document.createElement('div')
          wrapper.className = 'mermaid-wrapper'
          pre.parentElement.insertBefore(wrapper, pre)
          wrapper.appendChild(pre)

          // 创建浮动控制栏
          var controls = document.createElement('div')
          controls.className = 'mermaid-controls'

          var btnZoomOut = document.createElement('button')
          btnZoomOut.className = 'mc-btn mc-zoom-out'
          btnZoomOut.title = '缩小'
          btnZoomOut.textContent = '\u2212'

          var levelEl = document.createElement('span')
          levelEl.className = 'mc-level'
          levelEl.textContent = '100%'

          var btnZoomIn = document.createElement('button')
          btnZoomIn.className = 'mc-btn mc-zoom-in'
          btnZoomIn.title = '放大'
          btnZoomIn.textContent = '+'

          var btnReset = document.createElement('button')
          btnReset.className = 'mc-btn mc-reset'
          btnReset.title = '重置'
          btnReset.textContent = '\u27F2'

          var updateLevel = () => {
            var pct = Math.round(panzoom.getScale() * 100)
            levelEl.textContent = pct + '%'
          }

          btnZoomOut.onclick = () => { panzoom.zoomOut(); updateLevel() }
          btnZoomIn.onclick = () => { panzoom.zoomIn(); updateLevel() }
          btnReset.onclick = () => { panzoom.reset(); updateLevel() }
          diagram.addEventListener('panzoomchange', updateLevel)

          controls.appendChild(btnZoomOut)
          controls.appendChild(levelEl)
          controls.appendChild(btnZoomIn)
          controls.appendChild(btnReset)
          wrapper.appendChild(controls)
        })
      }
    }, 50)
  }

  return {
    render: () => {
      // ---- 清理上一次渲染的痕迹 ----
      // 移除旧的 mermaid-wrapper（内含控制栏），将 <pre> 恢复原位
      Array.from(document.querySelectorAll('.mermaid-wrapper')).forEach(function (w) {
        var pre = w.querySelector('pre')
        if (pre) w.parentElement.insertBefore(pre, w)
        w.remove()
      })

      // ---- 恢复原始 Mermaid 源码 + 解码 HTML 实体 ----
      // 首次渲染：从 innerHTML 解码并保存到 data-original
      // 后续渲染（如主题切换）：从 data-original 恢复原始码（因为之前被 SVG 替换了）
      Array.from(document.querySelectorAll('pre code.mermaid')).forEach(function (codeEl) {
        var orig = codeEl.getAttribute('data-original')
        if (!orig) {
          orig = decodeEntities(codeEl.innerHTML)
          codeEl.setAttribute('data-original', orig)
        }
        codeEl.innerHTML = orig
        // 清除 data-processed，否则 mermaid.run() 会跳过已处理的元素
        codeEl.removeAttribute('data-processed')
      })

      // ---- 用当前主题重新初始化并渲染 ----
      var theme =
        state._themes[state.theme] === 'dark' ||
          (state._themes[state.theme] === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark' : 'default'
      mermaid.initialize({ theme, htmlLabels: false, securityLevel: 'loose' })
      mermaid.run({ querySelector: 'code.mermaid', suppressErrors: true }).then(() => {
        loaded = true
        initPanzoom()
      })
    }
  }
})()
