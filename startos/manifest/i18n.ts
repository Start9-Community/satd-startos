export const short = {
  en_US: 'A Bitcoin full node in Rust, with Electrum and Esplora built in',
  es_ES:
    'Un nodo completo de Bitcoin en Rust, con Electrum y Esplora integrados',
  de_DE: 'Ein Bitcoin-Full-Node in Rust, mit integriertem Electrum und Esplora',
  pl_PL: 'Pełny węzeł Bitcoin w Rust, z wbudowanym Electrum i Esplorą',
  fr_FR: 'Un nœud complet Bitcoin en Rust, avec Electrum et Esplora intégrés',
}

export const long = {
  en_US:
    "satd is a Bitcoin Core-compatible full node written in Rust. It speaks Core's JSON-RPC, config file and CLI, and serves an Electrum server and an Esplora REST API from the same process — no second indexer to run and no second copy of the chain to store. This package contains satd and its own tools only; Lightning, BTCPay and wallets come from the marketplace as separate services. It runs fully indexed, because Electrum and Esplora both require the transaction and address indices, so pruning is not offered and the disk budget is the full chain plus roughly the same again.",
  es_ES:
    'satd es un nodo completo de Bitcoin compatible con Bitcoin Core y escrito en Rust. Habla el JSON-RPC, el archivo de configuración y la CLI de Core, y sirve un servidor Electrum y una API REST Esplora desde el mismo proceso: sin un segundo indexador que ejecutar ni una segunda copia de la cadena que almacenar. Este paquete contiene únicamente satd y sus propias herramientas; Lightning, BTCPay y las carteras se instalan desde el marketplace como servicios independientes. Funciona con todos los índices activos, porque Electrum y Esplora requieren los índices de transacciones y direcciones, así que no se ofrece poda y el espacio en disco necesario es la cadena completa más aproximadamente otro tanto.',
  de_DE:
    'satd ist ein mit Bitcoin Core kompatibler Full Node, geschrieben in Rust. Er spricht das JSON-RPC, die Konfigurationsdatei und die CLI von Core und stellt einen Electrum-Server und eine Esplora-REST-API aus demselben Prozess bereit — kein zweiter Indexer, keine zweite Kopie der Blockchain. Dieses Paket enthält nur satd und seine eigenen Werkzeuge; Lightning, BTCPay und Wallets kommen als eigene Dienste aus dem Marketplace. Er läuft vollständig indexiert, da Electrum und Esplora den Transaktions- und den Adressindex benötigen; Pruning wird daher nicht angeboten, und der Speicherbedarf ist die gesamte Blockchain plus etwa noch einmal so viel.',
  pl_PL:
    'satd to pełny węzeł Bitcoin zgodny z Bitcoin Core, napisany w Rust. Obsługuje JSON-RPC, plik konfiguracyjny i CLI Core oraz udostępnia serwer Electrum i API REST Esplora z tego samego procesu — bez drugiego indeksera i bez drugiej kopii łańcucha. Ten pakiet zawiera wyłącznie satd i jego własne narzędzia; Lightning, BTCPay i portfele instaluje się z marketplace jako osobne usługi. Działa z pełnym indeksowaniem, ponieważ Electrum i Esplora wymagają indeksów transakcji i adresów, więc przycinanie (pruning) nie jest dostępne, a potrzebne miejsce na dysku to cały łańcuch plus mniej więcej drugie tyle.',
  fr_FR:
    "satd est un nœud complet Bitcoin compatible avec Bitcoin Core, écrit en Rust. Il parle le JSON-RPC, le fichier de configuration et la CLI de Core, et sert un serveur Electrum et une API REST Esplora depuis le même processus — pas de second indexeur à faire tourner ni de seconde copie de la chaîne à stocker. Ce paquet ne contient que satd et ses propres outils ; Lightning, BTCPay et les portefeuilles s'installent depuis le marketplace comme services séparés. Il fonctionne entièrement indexé, car Electrum et Esplora exigent tous deux les index des transactions et des adresses ; l'élagage n'est donc pas proposé et l'espace disque nécessaire est la chaîne complète plus à peu près autant.",
}
