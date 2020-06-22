const teleinfo = require('./teleinfo')
const inhibitors = { PAPP: 20, HCHC: 5, HCHP: 5 }
const trameEvents = teleinfo(process.argv[2] || '/dev/ttyUSB0', inhibitors)

trameEvents.on('rawFrame', function (data) {
  // console.log('rawFrame', data)
})

trameEvents.on('frame', function (data) {
  // console.log('frame', data)
  console.log('---')
})

trameEvents.on('change', function (data) {
  console.log('change', data.changes)
})

trameEvents.on('diff', function (data) {
  console.log('diff', data.diff)
})

trameEvents.on('error', function (error) {
  console.error(error)
})
