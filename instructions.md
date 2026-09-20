# Bitcoin (satd)

satd installs **in place of** Bitcoin Core or Bitcoin Knots — it is a different
implementation of the same Bitcoin service, and only one can be installed at a
time. Other services that depend on Bitcoin (Lightning nodes, electrs, Mempool,
…) do not work with satd and will report Bitcoin as unavailable while it is
installed. If you rely on any of them, this is not the node for you.

Switching from Core or Knots keeps the block files you already have and rebuilds
the rest: satd re-validates every block and builds its own indices, which on
mainnet takes days. **Do not stop the service, restart it, reboot, or change its
settings while that runs** — an interrupted rebuild starts downloading the
remaining chain from the network instead. Switching back to Core or Knots is the
same kind of rebuild on their side.

This node runs fully indexed — Electrum and Esplora both need the transaction
and address indices, and pruning is incompatible with them — so budget for the
full chain plus roughly the same again. Everything below works on any network;
the default is mainnet.

## Documentation

- [satd Operator Manual](https://epochbtc.github.io/satd/) — the upstream manual: configuration reference, authentication, the Electrum, Esplora and MCP surfaces, and how satd differs from Bitcoin Core.

## What you get on StartOS

A Bitcoin full node with five interfaces:

- **Electrum** — point Sparrow, Electrum, BlueWallet or Zeus at the `ssl://` address.
- **Esplora** — a Blockstream-compatible REST API under `/api`, for explorers and apps that speak it.
- **RPC** — Bitcoin Core-compatible JSON-RPC, with the credentials from **Set RPC Credentials**.
- **MCP** — lets an AI assistant query your own node instead of a public explorer.
- **Peer** — inbound connections from other Bitcoin nodes. The port follows the network.

## Getting set up

1. Start the service. It begins syncing mainnet from scratch; **Blockchain Sync** on the service's page shows block headers first, then blocks against headers. Early blocks are small, so the count runs well ahead of the time remaining. Balances from Electrum and Esplora are not trustworthy until the sync completes.
2. To run a test network instead, run **Network** and pick one. The node restarts on that chain and syncs it from scratch; each network keeps its own data, so switching back later does not lose what was synced.
3. To use the RPC interface from a wallet or script, run **Set RPC Credentials** and save the password it shows — it is not stored and cannot be shown again.

## Using satd

### Wallets

Copy the Electrum interface's `ssl://` address into your wallet's server settings. StartOS provides the certificate, so nothing needs importing.

### AI assistants (MCP)

1. Run **MCP Hostnames** and enter the name or address you use to reach this server — `my-server.local`, for example. Until a name is listed, requests by that name are refused. Separate several with commas.
2. Run **Set MCP Token** and copy the token. Configure the assistant with the MCP interface's address and `Authorization: Bearer <token>`.

Anyone holding the token can query the node, so treat it like a password. Run **Set MCP Token** again to replace it.

### Actions

- **Network** — switches the chain the node runs on and restarts it.
- **Set RPC Credentials** — generates a new RPC password and shows it once. Run it again to replace the password; clients using the old one stop working.
- **Set MCP Token** — generates a new MCP token and shows it once. Run it again to replace the token.
- **MCP Hostnames** — sets the names MCP accepts requests by.
- **CA Certificate** — shows the certificate authority satd generated for this install. You only need it for a client that connects to satd's own TLS listeners directly instead of through StartOS.

## Limitations

- **No pruning**, for the reason at the top.
- **No wallet.** Use a wallet app against the Electrum interface.
- **Other services cannot use satd in place of Bitcoin Core.** satd speaks Core's JSON-RPC, but it does not provide everything those services need, so they will not accept it as their Bitcoin dependency.
