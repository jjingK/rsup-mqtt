import {Client as PahoClient} from 'paho-client'
import Client from './Client'
import makePahoMessage from './makePahoMessage'
import pahoConnect from './pahoConnect'

export default function connect (userOpts, Ctor = Client) {
  if (typeof Ctor !== 'function') {
    throw new TypeError('The second argument must be a function, or a constructor.')
  }

  const {
    port = 4433,
    path = '/mqtt',
    ssl = false,
    clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    keepalive = 20,
    host,
    will,
    username,
    ...etcOpts
  } = userOpts

  const pahoOpts = {
    // rsupport default option
    timeout: 3,
    cleanSession: true,
    mqttVersion: 3,
    useSSL: ssl,
    keepAliveInterval: keepalive,
    ...etcOpts
  }

  if (username) pahoOpts.userName = username
  if (will) pahoOpts.willMessage = wrapPahoWill(will)

  const paho = new PahoClient(host, port, path, clientId)

  return pahoConnect(paho, pahoOpts)
    .then(() => {
      return createClient(Ctor, {paho, pahoOpts})
    })
}

function wrapPahoWill ({topic, payload, ...opts}) {
  return makePahoMessage(topic, payload, opts)
}

function createClient (Ctor, setting) {
  return (Client === Ctor || Ctor.prototype instanceof Client) ? new Ctor(setting) : Ctor(setting)
}
