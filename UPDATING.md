# Updating the upstream version

Upstream is tracked as a prebuilt Docker image, `ghcr.io/epochbtc/satd`, pinned by tag in
`startos/manifest/index.ts` (`images.satd.source.dockerTag`). The image carries `satd`,
`sat-cli`, `satd-init` and `satd-healthcheck`; the package runs it unmodified.

## Determining the upstream version

- Latest release: `gh release view -R epochbtc/satd --json tagName -q .tagName` (tags carry a
  `v` prefix, e.g. `v0.5.2`; the image tag drops it, `0.5.2`).
- Confirm the tag is published for both architectures before pinning it:
  ```sh
  TOKEN=$(curl -s "https://ghcr.io/token?scope=repository:epochbtc/satd:pull" | jq -r .token)
  curl -s -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.oci.image.index.v1+json" \
    https://ghcr.io/v2/epochbtc/satd/manifests/<tag> | jq '.manifests[].platform.architecture'
  ```
  — must list `amd64` and `arm64`.

## Applying the bump

1. Set `images.satd.source.dockerTag` in `startos/manifest/index.ts` to `ghcr.io/epochbtc/satd:<tag>`.
2. Set `version` in `startos/versions/current.ts` to `#satd:<tag>:0` — the `#satd:` flavor
   prefix stays — and rewrite `releaseNotes` in all five locales. A packaging-only change keeps
   the upstream half and bumps the revision instead.
3. Refresh `test/upstream/satd-init` from `contrib/stack/satd/satd-init` at the release's commit
   and update `test/upstream/SOURCE`; `npm run check` fails if the network list or a P2P port
   moved.
4. Diff `contrib/stack/satd/satd.conf.tmpl` and `satd-init` between the two tags for anything
   `startos/main.ts` relies on: the `NETWORK`, `SATD_P2P_PORT`, `SATD_STACK_SUBNET`,
   `SATD_MCP`, `SATD_MCP_ALLOWED_HOSTS` and `SATD_TLS_HOSTNAME` variables, the fixed listener
   ports in `startos/utils.ts`, the `secrets/mcp-token` path, and the `rpc-cookie` symlink
   `sat-cli` is pointed at. Check `docs/manual/src/config-reference.md` for `rpcauth`, which
   the package passes on the command line.
5. Rebuild and install on a StartOS box; confirm the node starts on a fresh datadir, **Set RPC
   Credentials** authenticates against the RPC interface, and an MCP `initialize` succeeds with
   a token from **Set MCP Token**.
