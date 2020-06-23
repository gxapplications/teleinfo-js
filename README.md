# Teleinfo-js

_Node module to read teleinformation frames from ErDF / Enedis main circuit breaker (in France)._

_Wrapped on `serialport` module to read from a serial / USB port. Tested on RaspberryPi._

Based on [Laurent HUET work](https://github.com/lhuet/teleinfo-node).

## Prerequisites
- A RaspberryPi or equivalent computer to plug adapter and run the module.
- An adapter (see tested hardware below) to plug between main circuit breaker TIC interface and your computer.
- This adapter should be able to connect to `serialport` module: sending serial data or emulate it from USB port.
- A classical white ErDF circuit breaker, or a Linky.
- For Linky, `TIC` must be set to `Historique` mode.


## Tested hardware
- RaspberryPi 2 with Raspbian.
- [GCE Electronics USB](https://www.amazon.fr/Module-t%C3%A9l%C3%A9information-USB-GCE-Electronics/dp/B01N1RMTTP/ref=sr_1_2?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2GN6G7KNXHZL&dchild=1&keywords=gce+electronics&qid=1592778369&sprefix=GCE+Ele%2Caps%2C153&sr=8-2).
- Tested on Linky (TIC History mode), use I1 and I2 outputs (no polarity).


## Start with a simple example to try it.
```shell script
mkdir teleinfo-test && cd teleinfo-test
npm install teleinfo-js

ls /dev/tty*
# this will scan serial ports. Plug/unplug your adapter to look after a change.
# Then for example 'ttyUSB0', type:
cd node_modules/teleinfo-js && npm run start -- /dev/ttyUSB0
```
You should receive more than 1 frame per minute. If so, you can start to write your own implementation.


## First step to begin
```javascript
const teleinfo = require('teleinfo')
// use your own port here:
const emitter = teleinfo('/dev/ttyUSB0')

emitter.on('rawFrame', function (data) {
  console.log('rawFrame', data)
  // You will receive ALL raw data.
})

emitter.on('error', function (error) {
  console.error(error)
  // In case of error from serialport module.
})
```


## For better events and parsed data
```javascript
emitter.on('connected', function (data) {
  console.log('connected', data)
  // When connection succeed and first data is received.
})
emitter.on('failure', function (data) {
  console.log('failure', data)
  // When connection cannot be established.
})
emitter.on('frame', function (data) {
  console.log('frame', data)
  // You will receive all parsed frames.
})
emitter.on('change', function (data) {
  console.log('change', data.changes)
  // You will receive only changes.
})

emitter.on('diff', function (data) {
  console.log('diff', data.diff)
  // You will receive a full structured diff object for convenience.
})
```


## For less events
You can add inhibitors to your teleinfo instance. These will avoid too many change/diff events to be triggered.
For example, to trigger events when `PAPP` value delta is above 30W, or `HCHP`/`HCHC` index delta are above 5Wh:
```javascript
const emitter = teleinfo('/dev/ttyUSB0', { 'PAPP': 30, 'HCHP': 5, 'HCHC': 5 })
```

By default, inhibitors = `{ 'PAPP': 20 }`.

---
Adaptations and improvements (c) 2020 GXApplications. Based on [Laurent HUET work](https://github.com/lhuet/teleinfo-node). | [License](https://github.com/gxapplications/teleinfo-js/blob/master/LICENSE)
