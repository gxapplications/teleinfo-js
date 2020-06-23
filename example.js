const teleinfo = require('./teleinfo')
const inhibitors = { PAPP: 20, HCHC: 5, HCHP: 5 }
const emitter = teleinfo(process.argv[2] || '/dev/ttyUSB0', inhibitors)

emitter.on('connected', function () {
  console.log('You are connected!')
})

emitter.on('failure', function (error) {
  console.log('Cannot connect!', error)
})

emitter.on('rawFrame', function (data) {
  // console.log('rawFrame', data)
})

emitter.on('frame', function (data) {
  // console.log('frame', data)
  console.log('---')
})

emitter.on('change', function (data) {
  console.log('change', data.changes)
})

emitter.on('diff', function (data) {
  console.log('diff', data.diff)
})

emitter.on('error', function (error) {
  console.error(error)
})
