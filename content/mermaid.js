
var mmd = (() => {
  var loaded = false

  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  var initPanzoom = () => {
    var diagrams = Array.from(document.querySelectorAll('code.mermaid'))
    var timeout = setInterval(() => {
      var svg = Array.from(document.querySelectorAll('pre code.mermaid svg'))
      if (diagrams.length === svg.length) {
        clearInterval(timeout)
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
      // 每次渲染前，将 code.mermaid 中的 HTML 实体解码为原始字符
      // （markdown 编译器会把 <br> 转义为 &lt;br&gt;，Mermaid 内部
      //  的 entityDecode 在 content script 中不可靠，手动解码确保可靠）
      Array.from(document.querySelectorAll('pre code.mermaid')).forEach(function (codeEl) {
        codeEl.innerHTML = codeEl.innerHTML
          .replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
          .replace(/&quot;/g, '"')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&amp;/g, '&')
      })

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
