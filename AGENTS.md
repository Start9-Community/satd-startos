# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Fix a defect you spot rather than reporting it** — you have the package open and the
context to be sure. File **a GitHub issue on this repo** only when the call isn't yours to
make: you can't pin the cause down, two defensible fixes exist, or it's too large to ride on
the work in hand. An open issue is a report, not a queue — implement one when you're asked
to or when it's labelled `Approved`, then close it with `Closes #<n>`.

Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **This is the `satd` flavor of `bitcoind`, not a package of its own.** `id: 'bitcoind'`,
  version `#satd:<upstream>:<rev>`. Same id is what makes it mutually exclusive with Core and
  Knots; the flavor is what keeps every dependent's unflavored `bitcoind` range from matching
  it. Don't give it its own id, and don't write `versionRange`s elsewhere that accept it
  without verifying the dependent against satd.
- **`migrations.other` in `startos/versions/current.ts` carries the flavor switch both ways**,
  keyed by Core's major series and `#knotsprerdts`. `blocks/` is shared and never touched;
  each side rebuilds its own chainstate from it (satd via the store's one-shot `reindex`,
  Core via `reindexBlockchain` in its `store.json`, modelled in `fileModels/coreStore.json.ts`
  as a loose object so nothing else in that file is stripped). `main.ts` reads `reindex`
  with `.once()` and clears it before launch — reading it under the `.const()` map would
  restart satd the moment the flag is cleared.
- **`satd-init` in the image owns `bitcoin.conf`, the CA and the authfile.** The package
  never writes the config itself; a setting reaches satd through `satd-init`'s environment
  (`startos/main.ts`), satd's command line, or `conf.d/local.conf`, which the script appends
  last. Writing `bitcoin.conf` from the package is overwritten on the next start.
- **The network is a command-line argument, never a config line.** satd accepts a `signet=1`
  line in `bitcoin.conf` and then runs mainnet regardless.
- **`startos/networks.ts` must stay free of SDK imports.** `test/networks.test.ts` loads it
  under node's type stripping and checks it against `test/upstream/satd-init`, a copy vendored
  from the satd commit the package targets; refresh that copy when the image moves.
- **`npm run check` runs the tests.** `node --experimental-strip-types --test test/*.test.ts`;
  `tsconfig.json` includes `test/` and sets `rewriteRelativeImportExtensions` for them.
- **`icon.webp` is upstream's `docs/assets/logo.png`** re-encoded at quality 90 — the
  original is 195 KiB and an icon is embedded in every registry index.
