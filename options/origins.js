
var Origins = () => {
  var defaults = {
    // storage
    origins: {},
    match: '',
    // UI
    host: '',
    timeout: null,
    file: true,
    // chrome
    permissions: {},
  }

  var state = Object.assign({}, defaults)

  chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
    state.file = /Firefox/.test(navigator.userAgent)
      ? true // ff: `Allow access to file URLs` option isn't available
      : isAllowedAccess
    m.redraw()
  })

  chrome.runtime.sendMessage({ message: 'options.origins' }, (res) => {
    Object.assign(state, { file: state.file }, res)
    chrome.permissions.getAll(({ origins }) => {
      state.permissions = origins.reduce((all, origin) =>
        (all[origin.replace(/(.*)\/\*$/, '$1')] = true, all), {})
      m.redraw()
    })
  })

  var events = {
    file: () => {
      chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` })
    },

    host: (e) => {
      state.scheme = e.target.value.replace(/(.*):\/\/.*/i, '$1')
      state.domain = e.target.value.replace(/.*:\/\/([^/]+).*/i, '$1')
      state.host = e.target.value
    },

    add: (all) => () => {
      if (!all && !state.host && !['https', 'http', '*'].includes(state.scheme)) {
        return
      }
      var origin = all ? '*://*' : `${state.scheme}://${state.domain}`
      if (/Firefox/.test(navigator.userAgent) && /:\d{2,4}/.test(origin)) {
        origin = origin.replace(/(:\d{2,4})/, '')
      }
      chrome.permissions.request({ origins: [`${origin}/*`] }, (granted) => {
        if (granted) {
          chrome.runtime.sendMessage({ message: 'origin.add', origin })
          state.origins[origin] = {
            header: true,
            path: true,
            match: state.match,
          }
          state.host = ''
          state.permissions[origin] = true
          m.redraw()
        }
      })
    },

    remove: (origin) => () => {
      chrome.permissions.remove({ origins: [`${origin}/*`] }, (removed) => {
        if (removed) {
          chrome.runtime.sendMessage({ message: 'origin.remove', origin })
          delete state.origins[origin]
          delete state.permissions[origin]
          m.redraw()
        }
      })
    },

    refresh: (origin) => () => {
      chrome.permissions.request({ origins: [`${origin}/*`] }, (granted) => {
        if (granted) {
          state.permissions[origin] = true
          m.redraw()
        }
      })
    },

    header: (origin) => () => {
      state.origins[origin].header = !state.origins[origin].header
      var { header, path, match } = state.origins[origin]
      chrome.runtime.sendMessage({
        message: 'origin.update',
        origin,
        options: { header, path, match },
      })
    },

    path: (origin) => () => {
      state.origins[origin].path = !state.origins[origin].path
      var { header, path, match } = state.origins[origin]
      chrome.runtime.sendMessage({
        message: 'origin.update',
        origin,
        options: { header, path, match },
      })
    },

    match: (origin) => (e) => {
      state.origins[origin].match = e.target.value
      clearTimeout(state.timeout)
      state.timeout = setTimeout(() => {
        var { header, path, match } = state.origins[origin]
        chrome.runtime.sendMessage({
          message: 'origin.update',
          origin,
          options: { header, path, match },
        })
      }, 750)
    },
  }

  // MDC 已移除，涟漪效果由 CSS .m-button::after 实现
  // 文本输入框样式由纯 CSS 控制
  var oncreate = {}

  // 开关状态由 CSS input:checked 控制，无需额外 DOM 操作
  var onupdate = {}

  var render = () =>
    m('.m-origins',

      // file access
      m('.row',
        m('.col-xxl-10.col-xl-10.col-lg-9.col-md-8.col-sm-12',
          m('h3', '文件访问'),
        ),
        m('.col-xxl-2.col-xl-2.col-lg-3.col-md-4.col-sm-12',
          // file access is disabled
          (!state.file || null) &&
          m('button.m-button m-btn-file', {
            onclick: events.file
          },
            '允许访问'
          )
        ),
      ),
      ...Object.keys(state.origins)
        .filter((origin) => origin === 'file://' && state.file)
        .map(callout),

      // site access
      m('.row',
        m('.col-xxl-10.col-xl-10.col-lg-10.col-md-9.col-sm-8',
          m('h3', '站点访问'),
        ),
        (!Object.keys(state.origins).includes('*://*') || null) &&
        m('.col-xxl-2.col-xl-2.col-lg-2.col-md-3.col-sm-4',
          m('button.m-button m-btn-all', {
            onclick: events.add(true)
          },
            '全部允许'
          ),
        ),
      ),

      // add origin
      m('.bs-callout.m-box-add',
        m('.row',
          m('.col-sm-12',
            m('.m-input-row',
              m('.m-textfield',
                m('input', {
                  type: 'text',
                  value: state.host,
                  onchange: events.host,
                  placeholder: '在此粘贴网址'
                })
              ),
              m('button.m-button m-btn-add', {
                onclick: events.add()
              },
                '添加'
              ),
            )
          )
        )
      ),

      // allowed origins
      ...Object.keys(state.origins)
        .filter((origin) => origin !== 'file://')
        .sort((a, b) => a < b ? 1 : a > b ? -1 : 0)
        .map(callout)
    )

  var callout = (origin) =>
    m('.bs-callout', { class: !state.permissions[origin] ? 'm-box-refresh' : undefined },
      // origin
      m('.row',
        m('.col-xxl-8.col-xl-8.col-lg-8.col-md-7.col-sm-12 m-overflow', m('span.m-origin', origin)),
        m('.col-xxl-4.col-xl-4.col-lg-4.col-md-5.col-sm-12',
          // remove
          (origin !== 'file://' || null) &&
          m('button.m-button m-btn-remove', {
            onclick: events.remove(origin)
          },
            '移除'
          ),
          // refresh
          (!state.permissions[origin] || null) &&
          m('button.m-button m-btn-refresh', {
            onclick: events.refresh(origin)
          },
            '刷新'
          )
        )
      ),
      // header detection
      m('.row',
        m('.col-sm-12',
          m('.overflow',
            m('label.m-switch', {
              title: '切换头部检测'
            },
              m('input.m-switch-input', {
                type: 'checkbox',
                checked: state.origins[origin].header,
                onchange: events.header(origin)
              }),
              m('span.m-switch-track'),
              m('span.m-switch-label',
                '内容类型检测：',
                m('span', 'text/markdown'),
                ', ',
                m('span', 'text/x-markdown'),
                ', ',
                m('span', 'text/plain'),
              )
            ),
          )
        )
      ),
      // path matching regexp
      m('.row',
        m('.col-sm-12',
          m('.overflow',
            m('label.m-switch', {
              title: '切换路径匹配'
            },
              m('input.m-switch-input', {
                type: 'checkbox',
                checked: state.origins[origin].path,
                onchange: events.path(origin)
              }),
              m('span.m-switch-track'),
              m('span.m-switch-label',
                '路径匹配正则：'
              )
            ),
            m('.m-textfield',
              m('input', {
                type: 'text',
                onkeyup: events.match(origin),
                value: state.origins[origin].match,
              })
            )
          )
        )
      )
    )

  return { state, render }
}
