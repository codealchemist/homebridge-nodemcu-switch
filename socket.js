const WebSocket = require('ws')

let logger = console.log
let onDeviceCallback

function setLogger (newLogger) {
  logger = newLogger
}

function connect (url) {
  const ws = new WebSocket(url, {
    perMessageDeflate: false
  });
  
  ws.on('open', () => {
    logger('WS open')
  })
  
  ws.on('message', (data) => {
    logger('GOT DATA', data)
    const message = JSON.parse(data)
    if (
      message.type === 'discovery'
      && typeof onDeviceCallback === 'function'
    ) {
      logger('ON DEVICE', message)
      onDeviceCallback(message)
    }
  })
}

function onDevice (callback) {
  onDeviceCallback = callback
}

module.exports = {
  setLogger,
  connect,
  onDevice
}
