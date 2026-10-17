import { doesNotMatch, match } from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Swapping `.const(effects)` for `.once()` is not a type error, and only the
// daemon staying on the old chain after a Network change shows it.
const read = (p: string) =>
  readFileSync(new URL(p, import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')

test('main reads the store reactively, so the actions take effect', () => {
  const src = read('../startos/main.ts')
  match(src, /storeJson\s*\.read\(\(\{ network,[\s\S]*?\)\s*\.const\(effects\)/)
  // The one-shot reindex flag is the only key read without a watch.
  doesNotMatch(
    src.replace(/storeJson\.read\(\(s\) => s\.reindex\)\.once\(\)/, ''),
    /storeJson\.read\([\s\S]*?\)\.once\(\)/,
  )
})

test('interfaces reads the store reactively, so the P2P port follows', () => {
  const src = read('../startos/interfaces.ts')
  match(src, /storeJson\.read\([\s\S]*?\)\.const\(effects\)/)
})

// /readyz is 503 until the tip is within six blocks of the headers tip, which
// as the ready gate would hold the service on "starting" for the whole sync.
test('the ready gate probes liveness, not readiness', () => {
  const src = read('../startos/main.ts')
  match(src, /satdSub\.exec\(\['\/usr\/local\/bin\/satd-healthcheck'\]\)/)
  doesNotMatch(src, /readyz/)
  doesNotMatch(src, /SATD_HEALTH_URL/)
})

test('the MCP hostnames and token reach satd-init', () => {
  const src = read('../startos/main.ts')
  match(src, /SATD_MCP_ALLOWED_HOSTS:\s*mcpHostnames/)
  match(src, /const \{[^}]*mcpHostnames[^}]*\} = store/)
  match(src, /secrets\/mcp-token/)
})

test('the package never disables the MCP Host check', () => {
  const src = read('../startos/main.ts')
  doesNotMatch(src, /mcpallowanyhost|disable_allowed_hosts|mcptrustedproxy/i)
})

// satd's verificationprogress is timestamp-based: ~69% at genesis.
test('Blockchain Sync does not report verificationprogress', () => {
  doesNotMatch(read('../startos/main.ts'), /verificationprogress/)
})
