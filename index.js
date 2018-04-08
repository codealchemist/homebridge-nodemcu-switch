let Service, Characteristic
const request = require('request')
const socket = require('./socket')

class NodeMCUSwitch {
  constructor (log, config) {
    this.log = log

    this.discoveryUrl = config['discoveryUrl']
    socket.setLogger = this.log
    socket.connect(this.discoveryUrl)
    socket.onDevice((device) => {
      this.log('GOT DEVICE:', device)
      this.deviceIp = device.ip
      this.endpoints = {
        state: `${this.deviceIp}/state`,
        on: `${this.deviceIp}/on`,
        off: `${this.deviceIp}/off`,
        switch: `${this.deviceIp}/switch`
      }
      this.booleanEndpoints = {
        true: this.endpoints.on,
        false: this.endpoints.off
      }
    })

    this.http_method = config['http_method']
    this.sendimmediately = config['sendimmediately']
    this.default_state_off = config['default_state_off']
    this.name = config['name']    
  }

  getPowerState (callback) {
    request(this.endpoints.state, (err, response, body) => {
      if (err) throw new Error('ERR: getPowerState failed', err)
      this.log('POWER STATE:', body)
      const data = JSON.parse(body)
      callback(null, data.state)
    })
  }

  setPowerState (state, callback) {
    const endpoint = this.booleanEndpoints[state]
    request(endpoint, (err, response, body) => {
      if (err) {
        this.log('HTTP power function failed')
        callback(err)
      } else {
        this.log('HTTP power function succeeded!')
        this.log('RESPONSE BODY', body)
        var info = JSON.parse(body)
        this.log(body)
        this.log(info)
        callback()
      }
    })
  }

  identify (callback) {
    this.log('Identify requested!')
    callback() // success
  }

  getServices () {
    const informationService = new Service.AccessoryInformation()

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Berthing')
      .setCharacteristic(Characteristic.Model, 'Switch v1')
      .setCharacteristic(Characteristic.SerialNumber, '1b249115-c1f2-41aa-bfb7-045d0426f4f7')

    const switchService = new Service.Switch(this.name)
    switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getPowerState.bind(this))
      .on('set', this.setPowerState.bind(this))

    return [switchService]
  }
}

module.exports = (homebridge) => {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('NodeMCUSwitch', 'NodeMCUSwitch', NodeMCUSwitch)
}
