/* https://www.enedis.fr/sites/default/files/Enedis-NOI-CPT_54E.pdf */

const events = require('events');
const serialport = require('serialport');
const Readline = require('@serialport/parser-readline');
const isEqual = require('lodash.isequal');
const reduce = require('lodash.reduce');

function compareObjects (a, b) {
  const diffs = reduce(a, function (acc, v, k) {
    return isEqual(v, b[k]) ? acc : acc.k = { old: v, new: b[k] };
  }, {});
  return reduce(b, function (acc, v, k) {
    return isEqual(v, a[k]) ? acc : acc.k = { old: a[k], new: v };
  }, diffs);
}

function parseRaw (data, frame, frameEvents) {
  const elements = data.split(' ');
  if (elements.length === 3) {
    let sum = 0;
    let j;
    for (j = 0; j < data.length - 2; j++) {
      sum += data.charCodeAt(j);
    }
    sum = (sum & 63) + 32;
    if (sum === data.charCodeAt(j + 1)) {
      switch (elements[0].substr(0, 4)) {
        case 'BASE': // Index Tarif bleu
        case 'HCHC': // Index Heures creuses
        case 'HCHP': // Index Heures pleines
        case 'EJPH': // Index EJP (HN et HPM)
        case 'BBRH': // Index Tempo (HC/HP en jours Blanc, Bleu et Rouge)
        case 'ISOU': // Intensité souscrite
        case 'IINS': // Intensité instantannée (1/2/3 pour triphasé)
        case 'ADPS': // Avertissement de dépassement
        case 'IMAX': // Intensité max appelée (1/2/3 pour triphasé)
        case 'PAPP': // Puissance apparente
        case 'PMAX': // Puissance max triphasée atteinte
          frame[elements[0]] = Number(elements[1]);
          break;
        default:
          frame[elements[0]] = elements[1];
      }
      return true;
    } else {
      const error = new Error('Checksum error: \n' + data + '\nComputed/Receive: ' + sum + '/' + data.charCodeAt(j+1));
      frameEvents.emit('error', error);
    }
  } else {
    // TODO :0! what to do ? error ?
  }
  return false;
}

function teleinfo (port) {
  const frameEvents = new events.EventEmitter();
  let isFirstFrame = true;
  let lastFrame = {};
  const serialPort = new serialport(
    port,
    { baudRate: 1200, dataBits: 7, parity: 'even', stopBits: 1 }
  );
  const parser = new Readline({ delimiter: String.fromCharCode(13, 3, 2, 10) });
  serialPort.pipe(parser);

  parser.on('data', function (data) {
    frameEvents.emit('rawFrame', data);
    isFirstFrame = false;
  });

  parser.on('error', function (err) {
    frameEvents.emit('error', err);
  });

  frameEvents.on('rawFrame', function (data) {
    const frame = {};
    data.split('\r\n').forEach((d) => {
      parseRaw(d, frame, frameEvents);
    });

    // test if ADCO is present (first line of the frame)
    if (frame.ADCO !== undefined) {
      frameEvents.emit('frame', frame);
    } else if (!isFirstFrame) { // avoid error to be thrown if first frame is not complete (just ignore it)
      frameEvents.emit('error', new Error('Partial frame'));
    }
  });

  frameEvents.on('frame', function (data) {
    const diff = compareObjects(lastFrame, data);
    if (Object.keys(diff).length > 0) {
      const changes = {};
      for (let attr in diff) {
        changes[attr] = diff[attr].new;
      }
      frameEvents.emit('change', { changes: changes, t: Date.now() });
      frameEvents.emit('diff', { old: lastFrame, new: data, diff: diff, t: Date.now() });
    }
  });

  return frameEvents;
}

module.exports = teleinfo;
