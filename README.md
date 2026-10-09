<p align="center">
  <img src="icon.webp" alt="satd Logo" width="21%">
</p>

# Bitcoin (satd) on StartOS

> Everything not listed in this document should behave the same as upstream
> satd. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation
> section of `instructions.md` for links.

satd is a Bitcoin Core-compatible full node in Rust that serves an Electrum
server, an Esplora REST API and an MCP server from one process. This package
is the `satd` **flavor of the `bitcoind` package**: it installs in place of
Bitcoin Core or Bitcoin Knots, never beside them, and switching between them
keeps the block files. It runs the upstream image unmodified, drives its
first-run script, and hands the network choice, the RPC credential and the
MCP token to StartOS actions. See
[the upstream project](https://github.com/epochbtc/satd) for the application
itself.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One subcontainer, `satd-sub`, runs the unmodified upstream image on x86_64 and
aarch64. The package supplies its own commands rather than the image's
entrypoint: two oneshots run before the daemon on every start.

| Step        | Command                     | User   | Purpose                                                                                                                  |
| ----------- | --------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `own-volume` | `chown -R satd:satd`       | `root` | StartOS mounts the volume root-owned; the image runs as `satd` (uid 2121).                                               |
| `satd-init` | `/usr/local/bin/satd-init` | `satd` | The image's own first-run script: issues the per-install CA, renders `bitcoin.conf` for the network, hashes the MCP token into the authfile. |
| `satd`      | `satd --datadir --chain …` | `satd` | The node. `--rpcauth` is appended once the RPC credential has been set.                                                   |

`satd-init` is driven by environment: `NETWORK`, `SATD_P2P_PORT`,
`SATD_STACK_SUBNET` (the container bridge, rendered as `rpcallowip`),
`SATD_MCP=1`, `SATD_MCP_ALLOWED_HOSTS` and `SATD_TLS_HOSTNAME=satd.startos`.

## Volume and Data Layout

Everything lives on one volume, `main`, mounted at `/var/lib/satd` — satd's
datadir.

| Path                    | Contents                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `blocks/`, `chainstate/` | Mainnet chain and chainstate; every index satd keeps lives inside `chainstate/`.      |
| `<network>/`            | The same layout for each non-mainnet network (`signet/`, `testnet4/`, …).             |
| `bitcoin.conf`          | Rendered by `satd-init` on every start; never edit it.                                |
| `tls/`                  | The per-install CA and the certificate satd's own TLS listeners present.              |
| `secrets/mcp-token`     | The MCP bearer token, written by the package from `startos-store.json` on every start. |
| `authfile.toml`         | The token's hash, rendered by `satd-init`.                                            |
| `rpc-cookie`            | A symlink `satd-init` points at the live network's cookie.                            |
| `startos-store.json`    | This package's own state (below).                                                     |
| `store.json`            | Bitcoin Core's package state, left in place across a flavor switch.                   |

## File Models

One model, `startos-store.json`, holds the state StartOS owns: the network,
the MCP hostnames, the RPC credential's `rpcauth` line (hash only), the MCP
token, and a one-shot `reindex` flag. It is seeded at install with mainnet and
a freshly generated token, and rewritten only by the actions and the flavor
migration. A hand edit is read on the next start; `reindex: true` puts
`--reindex` on the next start and is cleared as satd launches.

`store.json` is Bitcoin Core's own store, modelled here only for its
`reindexBlockchain` flag, which the switch back to Core sets.

`bitcoin.conf` is deliberately not a model: `satd-init` regenerates it from the
template inside the image on every start, so an edit does not survive a
restart. The network is passed on satd's command line rather than written to
the file, because satd accepts a network line in `bitcoin.conf` and then runs
mainnet regardless. Operator additions belong in `conf.d/local.conf`, which
`satd-init` appends last.

## Dependencies

None. satd serves its own Electrum and Esplora surfaces.

Being a flavor, this package satisfies no other service's dependency on
`bitcoind`: a version range written for Core or Knots (`>=28.4:17`, …) never
matches `#satd:…`, so Lightning, electrs, Mempool and the rest report Bitcoin
as unsatisfied while satd is installed. satd publishes no `rawblock` /
`rawtx` ZMQ topics, so that is correct rather than conservative; a dependent
that has verified itself against satd can opt in with `|| #satd:>=0.5.2:0`.

## Network Access and Interfaces

| Interface id | Type  | Internal port | Protocol                   | Serves                                                                                              |
| ------------ | ----- | ------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| `rpc`        | `api` | 8332          | HTTP, TLS added by the OS  | Bitcoin Core-compatible JSON-RPC. Cookie auth inside the container; the **Set RPC Credentials** password from anywhere else. |
| `electrum`   | `api` | 50001         | raw TCP, `tcp://` / `ssl://` | The Electrum server, for Sparrow, Electrum, BlueWallet, Zeus.                                      |
| `esplora`    | `api` | 3000          | HTTP, TLS added by the OS  | The Esplora REST API under `/api`, unauthenticated.                                                 |
| `mcp`        | `api` | 8339          | HTTPS, rewrapped by the OS | The MCP server. Bearer token required; `Host` must be listed under **MCP Hostnames**.                |
| `peer`       | `p2p` | 8333 / 38333 / 48333 / 18333 / 18444 | raw TCP       | Inbound Bitcoin P2P. The port follows the network.                                                  |

satd's own TLS listeners (8336, 50002, 3001) are left unexported. MCP is
the one listener satd insists on serving over its own TLS off-loopback, so the
OS terminates the client's connection and opens a fresh one inward with
certificate validation disabled — the inward leg presents a certificate from
satd's per-install CA, which the OS cannot be taught. satd validates MCP's
`Host` header against an allowlist, and the OS proxy forwards the client's
`Host` unchanged, so every name a client uses has to be entered through **MCP
Hostnames**; a request by any other name is answered `403`.

## Installation and First-Run Flow

Install seeds the store with mainnet and a generated MCP token; the node starts
syncing mainnet on the first start with no prompt. `satd-init` mints the CA and
renders the config on that start, so **CA Certificate** has nothing to show
until the service has run once. Nothing else is pre-configured: the RPC
interface answers only cookie auth until **Set RPC Credentials** is run, and MCP
answers `403` by hostname until **MCP Hostnames** is set.

**Installing over Bitcoin Core or Knots is a flavor switch**, and
`migrations.other` (keyed by Core's major series and the Knots flavor)
handles it in both directions. `blocks/` is shared as-is — satd reads Core's
`blk*.dat`/`rev*.dat` layout and honours Core's `xor.dat` key — and
everything implementation-specific is rebuilt from it. Both directions remove
chainstate and peer/mempool state at the root and in every supported network
directory, leaving each network's `blocks/` untouched:

- **Core → satd (`up`)**: removes Core's `chainstate/`,
  `chainstate_background/`, `indexes/`,
  `peers.dat` and `mempool.dat` and sets `reindex: true`, so satd's first
  start replays every block from the files into its own chainstate and
  indices. Verified on a Core-synced signet datadir: 322,807 headers indexed
  from the files, Core's tip selected, replay validated with no download.
- **satd → Core (`down`)**: removes satd's `chainstate/`,
  `chainstate_background/`, rendered `bitcoin.conf`, `authfile.toml`,
  `rpc-cookie`, `tls/`, `secrets/`, `peers.dat`, `mempool.dat` and
  `startos-store.json`, and sets `reindexBlockchain: true` in Core's
  `store.json` so Core reindexes from the same files. Core comes back with a
  default mainnet configuration. A flavor switch does not preserve a test-network
  selection. **This direction has not been run.**

The switch is a full reindex: satd validates every block again and rebuilds
the transaction and address indices. On mainnet that is days, not hours. Do
not stop the service, reboot, or run an action that restarts satd while it
runs — see Limitations.

## Actions

Five actions, all user-facing. Every one that changes a setting writes the
store, and the daemon chain re-runs on the change: `satd-init` re-renders the
config and satd restarts.

### `network` — Network

- **When to run it:** to move the node to signet, testnet4, testnet3 or regtest, or back to mainnet.
- **What it changes:** the `network` key, then the chain satd runs and the P2P port the `peer` interface binds.
- **Cost:** a restart, then a full sync of the new network. Each network's data sits in its own directory, so switching back finds the old chain where it was left.
- **Repeat safety:** idempotent; submitting the current network changes nothing.
- **Outputs:** none.

### `rpc-credentials` — Set RPC Credentials

- **When to run it:** before pointing a Core-compatible client at the RPC interface from off the bridge, and whenever the password should change.
- **What it changes:** the `rpcAuth` key — a Core-format `rpcauth` line for the fixed username `satd`, passed to satd on its command line. Only the salted hash is kept; the password is shown once.
- **Cost:** a restart.
- **Repeat safety:** every run replaces the password; clients using the old one stop authenticating. The metadata carries a confirmation warning once a credential exists.
- **Outputs:** the username and the new password.

### `mcp-token` — Set MCP Token

- **When to run it:** before connecting an assistant to MCP — the token seeded at install is never shown — and whenever it should rotate.
- **What it changes:** the `mcpToken` key, written to `secrets/mcp-token` on the next start and hashed into `authfile.toml` by `satd-init`.
- **Cost:** a restart.
- **Repeat safety:** every run replaces the token; assistants using the old one get `401`.
- **Outputs:** the new token.

### `mcp-hostnames` — MCP Hostnames

- **When to run it:** before MCP is used at all, and again when clients start reaching the server by a new name or address.
- **What it changes:** the `mcpHostnames` key, rendered by `satd-init` as one `mcpallowedhost=` line per entry.
- **Cost:** a restart.
- **Repeat safety:** idempotent. Loopback and the certificate's own name are always accepted and need not be listed.
- **Outputs:** none.

### `ca-certificate` — CA Certificate

- **When to run it:** when a client on the container bridge dials one of satd's own TLS listeners directly, or when an MCP client validates the inward certificate. Clients coming through the OS proxy do not need it.
- **What it changes:** nothing; it reads `tls/ca.crt`.
- **Cost:** a few seconds in a temporary container.
- **Repeat safety:** idempotent. Before the first start it reports that the CA has not been generated yet.
- **Outputs:** the PEM certificate authority.

## Tasks

None. The service is never held on a prompt; every action is optional.

## Health Checks

- **`satd` — Node.** Runs the image's `satd-healthcheck`, which sends a `getblockchaininfo` to the RPC listener and counts any HTTP reply. It goes green as soon as the listener is up, deliberately ahead of readiness: satd's `/readyz` stays `503` until the tip is within six blocks of the headers tip, which on a fresh mainnet node is days. `starting` past the first minute means satd is not binding RPC — read the daemon log.
- **`sync-progress` — Blockchain Sync.** Polls `getblockchaininfo` every 30 s (5 s while starting or failing). `loading` with a block count against the header count is initial block download; the count runs well ahead of the time remaining because early blocks are small. It reports heights rather than `verificationprogress`, which satd derives from timestamps and reads about 69 % at genesis. `failure` names the `sat-cli` error; `starting` means the node is not answering RPC yet.

## Backups and Restore

Strategy: the `main` volume copied wholesale, minus the chain. `blocks/`,
`chainstate/`, `chainstate_background/`, `mempool.dat`, `.cookie` and the
`rpc-cookie` symlink are excluded at the root and under every network
directory, so a backup holds the CA and certificate, the MCP token, the
authfile, the rendered config and the store — kilobytes, not hundreds of
gigabytes. A restored instance keeps its network, RPC credential, MCP token,
hostnames and CA, comes back stopped, and re-downloads the chain from the
network once started.

## Limitations and Differences

1. **A flavor switch that is interrupted re-downloads the rest of the chain.** satd ignores SIGTERM while connecting blocks, so a stop during the reindex becomes a kill after `sigtermTimeout`; on the next start satd does not resume from the block files already on disk but goes back to network IBD from the last flushed tip, writing the re-downloaded blocks into new `blk*.dat` files beside the originals. Both are upstream defects; until they are fixed the switch must run uninterrupted.
2. **No pruning.** Electrum and Esplora both require the transaction and address indices, which are incompatible with pruning; the upstream template runs fully indexed.
3. **Not a drop-in for Core or Knots.** satd speaks Core's JSON-RPC but publishes no `rawblock` / `rawtx` ZMQ topics; see Dependencies for what that means for other services.
4. **No wallet.** satd is a node; wallets connect through the Electrum interface.
5. **satd's own TLS listeners are not exported**, and its metrics endpoint (9332) is not exposed at all.
6. **One RPC credential**, with the fixed username `satd`; there is no multi-user `rpcauth` management.

---

## Quick Reference for AI Consumers

```yaml
package_id: 'bitcoind'
flavor: satd
image: ghcr.io/epochbtc/satd
architectures: [x86_64, aarch64]
subcontainers: [satd-sub]
volumes:
  main: /var/lib/satd
file_models:
  - startos-store.json
  - store.json
startos_managed_env_vars:
  - NETWORK
  - SATD_MCP
  - SATD_STACK_SUBNET
  - SATD_TLS_HOSTNAME
  - SATD_MCP_ALLOWED_HOSTS
  - SATD_P2P_PORT
  - SATD_CA_EXPORT_HINT
dependencies: none
interfaces:
  rpc: { type: api, port: 8332 }
  electrum: { type: api, port: 50001 }
  esplora: { type: api, port: 3000 }
  mcp: { type: api, port: 8339 }
  peer: { type: p2p, port: 8333 }
actions:
  - network
  - rpc-credentials
  - mcp-token
  - mcp-hostnames
  - ca-certificate
tasks: []
health_checks:
  - satd
  - sync-progress
```
