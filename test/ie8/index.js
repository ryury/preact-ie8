window.nowrap = (s) => s.replace(/(\r|\n)/g, '').toLowerCase()

window.fireEvent = function triggerEvent (target, event, process) {
  const e = document.createEventObject()
  if (process) process(e)
  target.fireEvent(`on${event}`, e)
}

window.before = window.beforeAll
window.after = window.afterAll

const spy = window.spy = jasmine.createSpy
window.sinon = { spy: spy }

beforeAll (() => {
  jasmine.addMatchers({
    calledWith: jasmineRequire.toHaveBeenCalledWith(jasmine),
    // property () {
    //   return {
    //     compare (actual) {
    //       console.log(arguments)
    //       return true
    //     }
    //   }
    // },
    calledOnce () {
      return {
        compare (actual) {
          return jasmineRequire.toHaveBeenCalledTimes(jasmine)().compare(actual, 1)
        }
      }
    }
  })
}) 


const testsContext = require.context('./', true, /\.spec$/)
testsContext.keys().forEach(testsContext)