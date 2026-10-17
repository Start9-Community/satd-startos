import { rm } from 'fs/promises'
import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import type { MigrationOpts } from '@start9labs/start-sdk/lib/version/VersionInfo'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { coreStoreJson } from '../fileModels/coreStore.json'
import { removeNetworkFiles } from '../utils'

const { main } = sdk.volumes

// Core and satd share blocks/ (Core's blk*.dat layout, xor key included);
// everything else is rebuilt from it by a reindex on the receiving side.
const fromCore = {
  up: async ({ effects }: MigrationOpts) => {
    await removeNetworkFiles([
      'chainstate',
      'chainstate_background',
      'indexes',
      'peers.dat',
      'mempool.dat',
    ])
    await storeJson.merge(effects, { reindex: true })
  },
  down: async ({ effects }: MigrationOpts) => {
    await removeNetworkFiles([
      'chainstate',
      'chainstate_background',
      'peers.dat',
      'mempool.dat',
    ])
    for (const p of [
      'bitcoin.conf',
      'authfile.toml',
      'rpc-cookie',
      'tls',
      'secrets',
      'startos-store.json',
    ])
      await rm(main.subpath(p), { recursive: true, force: true })
    await coreStoreJson.merge(effects, { reindexBlockchain: true })
  },
}

export const current = VersionInfo.of({
  version: '#satd:0.6.1:0',
  releaseNotes: {
    en_US:
      'Initial release for StartOS, on satd 0.6.1. A switch from Bitcoin Core or Knots that is stopped or interrupted now continues from the block files on disk on the next start instead of downloading the rest of the chain, and stopping the service during the rebuild exits cleanly. Updating an existing satd 0.5.x datadir automatically rebuilds its chainstate and indexes from local block files; allow days on mainnet. Full upstream changes: https://github.com/epochbtc/satd/compare/v0.5.2...v0.6.1',
    es_ES:
      'Lanzamiento inicial para StartOS, con satd 0.6.1. Un cambio desde Bitcoin Core o Knots que se detiene o se interrumpe ahora continúa en el siguiente arranque a partir de los archivos de bloques en disco, en lugar de descargar el resto de la cadena, y detener el servicio durante la reconstrucción termina limpiamente. Al actualizar un directorio de datos de satd 0.5.x, su estado de cadena e índices se reconstruyen automáticamente a partir de los archivos de bloques locales; en la red principal puede tardar días. Todos los cambios de upstream: https://github.com/epochbtc/satd/compare/v0.5.2...v0.6.1',
    de_DE:
      'Erstveröffentlichung für StartOS, mit satd 0.6.1. Ein Wechsel von Bitcoin Core oder Knots, der gestoppt oder unterbrochen wird, setzt beim nächsten Start mit den Blockdateien auf der Festplatte fort, statt den Rest der Blockchain herunterzuladen, und das Stoppen des Dienstes während des Neuaufbaus beendet ihn sauber. Beim Update eines vorhandenen satd-0.5.x-Datenverzeichnisses werden Chainstate und Indizes automatisch aus den lokalen Blockdateien neu aufgebaut; im Mainnet dauert dies unter Umständen Tage. Alle Upstream-Änderungen: https://github.com/epochbtc/satd/compare/v0.5.2...v0.6.1',
    pl_PL:
      'Pierwsze wydanie dla StartOS, z satd 0.6.1. Przejście z Bitcoin Core lub Knots, które zostanie zatrzymane lub przerwane, przy następnym uruchomieniu jest kontynuowane z plików bloków na dysku zamiast pobierać resztę łańcucha, a zatrzymanie usługi podczas odbudowy kończy ją poprawnie. Aktualizacja istniejącego katalogu danych satd 0.5.x automatycznie odbudowuje stan łańcucha i indeksy z lokalnych plików bloków; w sieci głównej może to potrwać kilka dni. Wszystkie zmiany upstream: https://github.com/epochbtc/satd/compare/v0.5.2...v0.6.1',
    fr_FR:
      "Version initiale pour StartOS, avec satd 0.6.1. Un passage depuis Bitcoin Core ou Knots arrêté ou interrompu reprend désormais au démarrage suivant à partir des fichiers de blocs sur le disque au lieu de télécharger le reste de la chaîne, et l'arrêt du service pendant la reconstruction se termine proprement. La mise à jour d'un répertoire de données satd 0.5.x existant reconstruit automatiquement son état de chaîne et ses index à partir des fichiers de blocs locaux ; prévoir plusieurs jours sur le réseau principal. Tous les changements en amont : https://github.com/epochbtc/satd/compare/v0.5.2...v0.6.1",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
    other: {
      ['^28']: fromCore,
      ['^29']: fromCore,
      ['^30']: fromCore,
      ['^31']: fromCore,
      ['#knotsprerdts']: fromCore,
    },
  },
})
