
var origins = Origins()
var popup = Popup()

m.mount(document.querySelector('main'), {
  view: () => [
    origins.render(),
    popup.options(),
  ]
})

// header menu — Help 链接到上游仓库
document.querySelector('.nav').addEventListener('click', (e) => {
  var target = e.target.closest('.nav-link')
  if (!target) return
  if (target.innerText === 'Help') {
    window.location = 'https://github.com/simov/markdown-viewer#table-of-contents'
  }
})
