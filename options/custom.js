
var Custom = () => {
  var defaults = {
    theme: '',
    color: 'auto',
    _colors: ['auto', 'light', 'dark'],
    error: '',
  }

  var state = Object.assign({}, defaults)

  chrome.runtime.sendMessage({ message: 'custom.get' }, (res) => {
    Object.assign(state, res)
    m.redraw()
  })

  var events = {
    file: (e) => {
      document.querySelector('input[type=file]').click()
    },
    theme: (e) => {
      var file = e.target.files[0]
      if (file) {
        var minified
        var reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = (e) => {
          minified = csso.minify(e.target.result).css
          chrome.runtime.sendMessage({
            message: 'custom.set',
            custom: {
              theme: minified,
              color: state.color,
            },
          }, (res) => {
            if (res?.error) {
              state.error = res.error
            }
            else {
              state.theme = minified
              state.error = ''
            }
            m.redraw()
          })
        }
      }
    },
    remove: (e) => {
      state.theme = ''
      state.error = ''
      chrome.runtime.sendMessage({
        message: 'custom.set',
        custom: {
          theme: state.theme,
          color: state.color,
        },
      })
      m.redraw()
    },
    color: (e) => {
      state.color = state._colors[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'custom.set',
        custom: {
          theme: state.theme,
          color: state.color,
        },
      })
    }
  }

  // MDC 已移除，涟漪效果由 CSS .m-button::after 实现
  var oncreate = {}

  var onupdate = {}

  var render = () => [
    m('.bs-callout m-custom',
      state.error &&
      m('.row',
        m('.col-12',
          m('span.m-label.m-error', state.error)
        )
      ),
      m('.row',
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('span.m-label',
            '自定义主题'
          )
        ),
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('input', {
            type: 'file',
            accept: '.css',
            onchange: events.theme,
            oncancel: events.theme,
          }),
          m('button.m-button', {
            onclick: events.file
          },
            !state.theme ? '添加' : '更新'
          ),
          state.theme &&
          m('button.m-button', {
            onclick: events.remove
          },
            '移除'
          ),
        ),
      ),
      state.theme &&
      m('.row',
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('span.m-label',
            '配色方案'
          )
        ),
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('select.m-select', {
            onchange: events.color
          },
            state._colors.map((color) =>
              m('option', {
                selected: state.color === color,
              }, color)
            )
          )
        ),
      ),
    )
  ]

  return { state, render }
}
