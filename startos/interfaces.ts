import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  electrumHostId,
  electrumInterfaceId,
  electrumPort,
  electrumTlsPort,
  esploraHostId,
  esploraInterfaceId,
  esploraPort,
  esploraTlsPort,
  mcpHostId,
  mcpInterfaceId,
  mcpPort,
  p2pPorts,
  peerHostId,
  peerInterfaceId,
  rpcHostId,
  rpcInterfaceId,
  rpcPort,
} from './utils'

// satd's own TLS listeners stay unexported; the OS terminates TLS for the
// plain ones. MCP is the exception: satd refuses a non-loopback MCP bind
// without its own TLS, so the OS rewraps that one.
export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const network =
    (await storeJson.read((s) => s.network).const(effects)) ?? 'mainnet'

  const rpcOrigin = await sdk.MultiHost.of(effects, rpcHostId).bindPort(
    rpcPort,
    { protocol: 'http', preferredExternalPort: rpcPort },
  )
  const rpc = sdk.createInterface(effects, {
    name: i18n('RPC'),
    id: rpcInterfaceId,
    description: i18n('Bitcoin Core-compatible JSON-RPC'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const electrumOrigin = await sdk.MultiHost.of(
    effects,
    electrumHostId,
  ).bindPort(electrumPort, {
    protocol: null,
    preferredExternalPort: electrumPort,
    secure: { ssl: false },
    addSsl: {
      preferredExternalPort: electrumTlsPort,
      addXForwardedHeaders: false,
      alpn: null,
      auth: null,
    },
  })
  const electrum = sdk.createInterface(effects, {
    name: i18n('Electrum'),
    id: electrumInterfaceId,
    description: i18n(
      'Electrum server, for Sparrow, Electrum, BlueWallet and Zeus',
    ),
    type: 'api',
    masked: false,
    schemeOverride: { ssl: 'ssl', noSsl: 'tcp' },
    username: null,
    path: '',
    query: {},
  })

  const esploraOrigin = await sdk.MultiHost.of(effects, esploraHostId).bindPort(
    esploraPort,
    {
      protocol: 'http',
      preferredExternalPort: esploraPort,
      addSsl: { preferredExternalPort: esploraTlsPort },
    },
  )
  const esplora = sdk.createInterface(effects, {
    name: i18n('Esplora'),
    id: esploraInterfaceId,
    description: i18n("Esplora REST API, compatible with Blockstream's"),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '/api',
    query: {},
  })

  // The inward leg presents a certificate from satd's per-install CA.
  const mcpOrigin = await sdk.MultiHost.of(effects, mcpHostId).bindPort(
    mcpPort,
    {
      protocol: 'https',
      preferredExternalPort: mcpPort,
      addSsl: {
        preferredExternalPort: mcpPort,
        upstreamCertValidation: 'disable',
      },
    },
  )
  const mcp = sdk.createInterface(effects, {
    name: i18n('MCP'),
    id: mcpInterfaceId,
    description: i18n(
      'Model Context Protocol server, so an AI assistant can query this node',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const peerOrigin = await sdk.MultiHost.of(effects, peerHostId).bindPort(
    p2pPorts[network],
    {
      protocol: null,
      preferredExternalPort: p2pPorts[network],
      secure: { ssl: false },
      addSsl: null,
    },
  )
  const peer = sdk.createInterface(effects, {
    name: i18n('Peer'),
    id: peerInterfaceId,
    description: i18n('Listens for connections from other Bitcoin nodes'),
    type: 'p2p',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [
    await rpcOrigin.export([rpc]),
    await electrumOrigin.export([electrum]),
    await esploraOrigin.export([esplora]),
    await mcpOrigin.export([mcp]),
    await peerOrigin.export([peer]),
  ]
})
