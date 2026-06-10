
var Popup = () => {

  var state = {
    compiler: '',
    options: {},
    content: {},
    theme: '',
    themes: {},
    _themes: [
      'github',
      'github-dark',
      // 'air',
      'almond',
      'awsm',
      'axist',
      'bamboo',
      'bullframe',
      'holiday',
      'kacit',
      'latex',
      'marx',
      'mini',
      'modest',
      'new',
      'no-class',
      'pico',
      'retro',
      'sakura',
      'sakura-vader',
      'semantic',
      'simple',
      // 'splendor',
      'style-sans',
      'style-serif',
      'stylize',
      'superstylin',
      'tacit',
      'vanilla',
      'water',
      'water-dark',
      'writ',
      'custom',
    ],
    _width: [
      'auto',
      'full',
      'wide',
      'large',
      'medium',
      'small',
      'tiny',
    ],
    raw: false,
    tab: '',
    tabs: ['theme', 'compiler', 'content'],
    compilers: [],
    description: {
      themes: {},
      compiler: {},
      content: {
        autoreload: '文件变更时自动重新加载',
        emoji: '将 Emoji 简码转换为 EmojiOne 图片',
        toc: '生成目录',
        mathjax: '渲染 MathJax 公式',
        mermaid: 'Mermaid 图表',
        syntax: '代码块语法高亮',
        hierarchy: '鼠标悬停时显示块级元素层级虚线',
      },
      _hierarchyStyles: ['off', 'line', 'outline', 'guide'],
    },
    settings: {}
  }

  var events = {
    tab: (e) => {
      state.tab = e.target.hash.replace('#tab-', '')
      localStorage.setItem('tab', state.tab)
      return false
    },

    compiler: {
      name: (e) => {
        state.compiler = state.compilers[e.target.selectedIndex]
        chrome.runtime.sendMessage({
          message: 'popup.compiler.name',
          compiler: state.compiler,
        }, () => {
          chrome.runtime.sendMessage({ message: 'popup' }, init)
        })
      },
      options: (e) => {
        state.options[e.target.name] = !state.options[e.target.name]
        chrome.runtime.sendMessage({
          message: 'popup.compiler.options',
          compiler: state.compiler,
          options: state.options,
        })
      }
    },

    content: (e) => {
      state.content[e.target.name] = !state.content[e.target.name]
      chrome.runtime.sendMessage({
        message: 'popup.content',
        content: state.content,
      })
    },

    contentHierarchy: (e) => {
      state.content.hierarchy = state._hierarchyStyles[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'popup.content',
        content: state.content,
      })
    },

    themes: (e) => {
      state.themes.width = state._width[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'popup.themes',
        themes: state.themes,
      })
    },

    theme: (e) => {
      state.theme = state._themes[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'popup.theme',
        theme: state.theme
      })
    },

    raw: () => {
      state.raw = !state.raw
      chrome.runtime.sendMessage({
        message: 'popup.raw',
        raw: state.raw
      })
    },

    defaults: () => {
      chrome.runtime.sendMessage({
        message: 'popup.defaults'
      }, () => {
        chrome.runtime.sendMessage({ message: 'popup' }, init)
        localStorage.removeItem('tab')
        state.tab = 'theme'
      })
    },

    advanced: () => {
      chrome.runtime.sendMessage({ message: 'popup.advanced' })
    }
  }

  var init = (res) => {
    state.compiler = res.compiler
    state.options = res.options
    state.content = res.content
    state.theme = res.theme
    state.themes = res.themes

    state.raw = res.raw
    state.tab = localStorage.getItem('tab') || 'theme'
    state.compilers = res.compilers
    state.description.compiler = res.description

    state.settings = res.settings
    document.querySelector('body').classList.add(state.settings.theme)

    m.redraw()
  }

  chrome.runtime.sendMessage({ message: 'popup' }, init)

  // MDC 已移除，涟漪效果通过 CSS .m-button::after 实现
  // 标签页通过 Mithril 状态 + CSS class 控制
  var oncreate = {}

  // 开关状态由 CSS input:checked 控制，无需额外 DOM 操作
  var onupdate = () => { }

  var render = () =>
    m('#popup',
      // raw
      m('button.m-button', {
        onclick: events.raw
      },
        (state.raw ? 'Html' : 'Markdown')
      ),
      // defaults
      m('button.m-button', {
        onclick: events.defaults
      },
        '默认值'
      ),

      // tabs
      m('nav.m-tabs', {
        onclick: events.tab
      },
        state.tabs.map((tab) =>
          m('a.m-tab', {
            href: '#tab-' + tab,
            class: state.tab === tab ? 'is-active' : ''
          },
            tab
          ))
      ),
      m('.m-panels',
        // theme
        m('.m-panel', {
          class: state.tab === 'theme' ? 'is-active' : ''
        },
          m('select.m-select', {
            onchange: events.theme
          },
            state._themes.map((theme) =>
              m('option', { selected: state.theme === theme }, theme)
            )
          ),
          m('select.m-select', {
            onchange: events.themes
          },
            state._width.map((width) =>
              m('option', {
                selected: state.themes.width === width,
              }, width)
            )
          ),
        ),
        // compiler
        m('.m-panel', {
          class: state.tab === 'compiler' ? 'is-active' : ''
        },
          m('select.m-select', {
            onchange: events.compiler.name
          },
            state.compilers.map((name) =>
              m('option', { selected: state.compiler === name }, name)
            )
          ),
          m('.scroll', {
            class: Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .length > 8
              ? 'max' : ''
          },
            Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .map((key) =>
                m('label.m-switch', {
                  onupdate: onupdate('compiler', key),
                  title: state.description.compiler[key]
                },
                  m('input.m-switch-input', {
                    type: 'checkbox',
                    name: key,
                    checked: state.options[key],
                    onchange: events.compiler.options
                  }),
                  m('span.m-switch-track'),
                  m('span.m-switch-label', key)
                )
              )
          )
        ),
        // content
        m('.m-panel', {
          class: state.tab === 'content' ? 'is-active' : ''
        },
          m('.scroll', Object.keys(state.content)
            .filter((key) => key !== 'hierarchy')
            .map((key) =>
              m('label.m-switch', {
                onupdate: onupdate('content', key),
                title: state.description.content[key]
              },
                m('input.m-switch-input', {
                  type: 'checkbox',
                  name: key,
                  checked: state.content[key],
                  onchange: events.content
                }),
                m('span.m-switch-track'),
                m('span.m-switch-label', key)
              ))
          ),
          // 层级虚线样式选择
          m('.m-switch', {
            title: state.description.content.hierarchy
          },
            m('span.m-switch-label', '层级虚线'),
            m('select.m-select', {
              onchange: events.contentHierarchy,
              style: { marginTop: '0', width: '100px' }
            },
              state._hierarchyStyles.map((style) =>
                m('option', {
                  selected: state.content.hierarchy === style,
                  value: style,
                }, ({
                  off: '关闭',
                  line: '简约线',
                  outline: '完整框线',
                  guide: '层级指引',
                })[style] || style)
              )
            )
          )
        )
      ),

      // advanced options
      m('button.m-button', {
        onclick: events.advanced
      },
        '高级设置'
      )
    )

  var options = () =>
    m('.row.m-settings',
      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', '主题'),
        m('.bs-callout.m-theme',
          m('.row',
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('span.m-label',
                '内容主题'
              )
            ),
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('select.m-select', {
                onchange: events.theme
              },
                state._themes.map((theme) =>
                  m('option', { selected: state.theme === theme }, theme)
                )
              )
            ),
          ),
          m('.row',
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('span.m-label',
                '内容宽度'
              )
            ),
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('select.m-select', {
                onchange: events.themes
              },
                state._width.map((width) =>
                  m('option', {
                    selected: state.themes.width === width,
                  }, width)
                )
              )
            ),
          ),
          settings.render()
        ),
        state.theme === 'custom' &&
        custom.render()
      ),

      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', '编译器'),
        m('.bs-callout.m-compiler',
          m('select.m-select', {
            onchange: events.compiler.name
          },
            state.compilers.map((name) =>
              m('option', { selected: state.compiler === name }, name)
            )
          ),
          m('.scroll', {
            class: Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .length > 8
              ? 'max' : ''
          },
            Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .map((key) =>
                m('label.m-switch', {
                  title: state.description.compiler[key]
                },
                  m('input.m-switch-input', {
                    type: 'checkbox',
                    name: key,
                    checked: state.options[key],
                    onchange: events.compiler.options
                  }),
                  m('span.m-switch-track'),
                  m('span.m-switch-label', key)
                )
              )
          )
        ),
      ),

      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', '内容'),
        m('.bs-callout.m-content',
          m('.scroll', Object.keys(state.content)
            .filter((key) => key !== 'hierarchy')
            .map((key) =>
              m('label.m-switch', {
                title: state.description.content[key]
              },
                m('input.m-switch-input', {
                  type: 'checkbox',
                  name: key,
                  checked: state.content[key],
                  onchange: events.content
                }),
                m('span.m-switch-track'),
                m('span.m-switch-label', key)
              ))
          ),
          // 层级虚线样式选择
          m('.row',
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('span.m-label', '层级虚线')
            ),
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('select.m-select', {
                onchange: events.contentHierarchy
              },
                state._hierarchyStyles.map((style) =>
                  m('option', {
                    selected: state.content.hierarchy === style,
                    value: style,
                  }, ({
                    off: '关闭',
                    line: '简约线',
                    outline: '完整框线',
                    guide: '层级指引',
                  })[style] || style)
                )
              )
            )
          )
        ),
      ),
    )

  return { state, render, options }
}

if (document.querySelector('.is-popup')) {
  var popup = Popup()
  m.mount(document.querySelector('body'), {
    view: (vnode) => popup.render()
  })
}
else {
  var settings = Settings()
  var custom = Custom()
}
