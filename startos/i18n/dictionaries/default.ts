export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'satd is starting…': 0,
  'Could not read ${cmd} from satd: ${error}': 1,
  Node: 2,
  'satd is ready': 3,
  'Blockchain Sync': 4,
  'satd is fully synced with ${chain}': 5,
  'Syncing ${chain} block headers: ${count}': 6,
  'Syncing ${chain} block headers…': 7,
  'Syncing ${chain} blocks: ${blocks} of ${headers}': 8,
  // interfaces.ts
  RPC: 9,
  'Bitcoin Core-compatible JSON-RPC': 10,
  Electrum: 11,
  'Electrum server, for Sparrow, Electrum, BlueWallet and Zeus': 12,
  Esplora: 13,
  "Esplora REST API, compatible with Blockstream's": 14,
  MCP: 15,
  'Model Context Protocol server, so an AI assistant can query this node': 16,
  Peer: 17,
  'Listens for connections from other Bitcoin nodes': 18,
  // actions/network.ts
  Network: 19,
  'Which Bitcoin network this node runs on': 20,
  'Changing the network restarts the node on a different chain. The existing chain data is kept — each network has its own directory — but the node re-syncs the new network from scratch, and the P2P port changes with it.': 21,
  'Mainnet is the Bitcoin network. The others are test networks whose coins have no value.': 22,
  // actions/rpcCredentials.ts
  'Set RPC Credentials': 23,
  'Generate a new password for the RPC interface. Replaces any existing one.': 24,
  'Replaces the current RPC password. Every client configured with it stops authenticating until it is updated.': 25,
  'RPC Credentials': 26,
  'Use these with any Bitcoin Core-compatible client on the RPC interface. The password is not kept anywhere; run this action again to replace it.': 27,
  Username: 28,
  Password: 29,
  // actions/mcpToken.ts
  'Set MCP Token': 30,
  'Generate a new bearer token for the MCP interface. Replaces the current one.': 31,
  'Replaces the current MCP token. Every assistant configured with it stops authenticating until it is updated.': 32,
  'MCP Token': 33,
  'Send this as `Authorization: Bearer <token>` to the MCP interface. Anyone holding it can query this node.': 34,
  // actions/mcpHostnames.ts
  'MCP Hostnames': 35,
  'The names this server is reached by, for MCP clients': 36,
  Hostnames: 37,
  'The hostname you type in the address bar to reach this server, such as my-server.local. Separate several with commas. Add one for every name clients use — an address reached by a name not listed here is refused.': 38,
  'MCP only. The other interfaces are unaffected by this setting.': 39,
  'A hostname, or hostname:port, separated by commas. Not a full URL — no https:// and no path.': 40,
  // actions/caCertificate.ts
  'CA Certificate': 41,
  "This install's certificate authority, for clients that reach satd's own TLS listeners directly": 42,
  'Not generated yet': 43,
  'satd-init writes the CA on the first start. Start the service once, then run this action again.': 44,
  'Import this certificate to trust this node directly.': 45,
  'PEM-encoded certificate authority': 46,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
