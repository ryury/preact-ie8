window.nowrap = (s) => s.replace(/(\r|\n)/g, '').toLowerCase()

window.fireEvent = function triggerEvent (target, event, process) {
  const e = document.createEventObject()
  if (process) process(e)
  target.fireEvent(`on${event}`, e)
}

const testsContext = require.context('./', true, /\.spec$/)
testsContext.keys().forEach(testsContext)