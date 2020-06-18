const teleinfo = require('./teleinfo')
const trameEvents = teleinfo('/dev/ttyUSB0')

trameEvents.on('rawFrame', function () {
  console.log('rawFrame')
})

trameEvents.on('frame', function (data) {
  console.log('frame', data)
})

trameEvents.on('change', function (data) {
  console.log('change', data)
})

trameEvents.on('diff', function (data) {
  console.log('diff', data)
})

trameEvents.on('error', function (error) {
  console.error(error)
})
