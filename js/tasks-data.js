/**
 * Manhattan Project — Los Alamos (TA-1, 1943–45)
 */
const ROLES = {
  staff: {
    id: "staff",
    label: "Personale del Progetto",
    team: "crew",
    blurb:
      "Campagna storica: Demon Core e glove box (plutonio), sabbia verde a Trinity, dogana all’ingresso — 4 missioni ★.",
  },
  spy: {
    id: "spy",
    label: "Spia sovietica",
    team: "soviet",
    blurb:
      "Fuchs (Fat Man), Rosenberg (documento falso), Seborer (innesco): 3 missioni poi «Dispatch a Mosca» (×3).",
  },
};

/** Task obbligatori per la vittoria crew (campagna missioni storiche) */
const CRITICAL_TASK_IDS = [
  "demon-core-stabilize",
  "pu-glovebox-shuttle",
  "trinity-sand-cleanup",
  "gate-boolean-check",
];

const MEETING_QUOTES = [
  "«Dobbiamo far funzionare questo laboratorio come una sola macchina.» — Oppenheimer, 1943",
  "«La bomba a cannone non basta per il plutonio: serve l’implosione.» — riunione Los Alamos, 1944",
  "«Groves vuole risultati; noi vogliamo che siano corretti.»",
  "«Trinity non è solo un test: è il giudizio della nostra fisica.» — luglio 1945",
  "«Ora divento la morte, il distruttore di mondi.» — Oppenheimer (cit. Bhagavad Gita, dopo Trinity)",
];

/** @typedef {{ id: string, name: string, type: string, steps?: number }} TaskDef */

const LOCATIONS = [
  {
    id: "building-d",
    name: "Chimica e plutonio",
    theme: "plutonium",
    x: 52,
    y: 58,
    tasks: [
      {
        id: "demon-core-stabilize",
        name: "★ Demon Core: i due incidenti — stabilizza con il cacciavite e acquisisci le misure",
        type: "sequence",
        steps: 1,
        oppenheimer: true,
      },
      {
        id: "pu-glovebox-shuttle",
        name: "★ Trasferire plutonio nel glove box (camera lavoro → confezione pit)",
        type: "sequence",
        steps: 1,
        oppenheimer: true,
      },
    ],
    intelSteal: "Appunti metallurgia plutonio e procedure purificazione Pu",
  },
  {
    id: "building-t",
    name: "Main Technical",
    theme: "technical",
    x: 62,
    y: 52,
    spyTasks: [
      {
        id: "spy-seborer-detonation",
        name: "★ Oscar Seborer: copiare schemi di innesco e detonazione nucleare",
        type: "sequence",
        steps: 1,
        theme: "espionage",
      },
    ],
    tasks: [
      { id: "t-log", name: "Archiviare dati del primo grande esperimento del lab", type: "sequence", steps: 4 },
      { id: "t-cal", name: "Sincronizzare orologi degli strumenti del settore T", type: "wires", steps: 4 },
      {
        id: "t-opp-sign",
        name: "Distribuire il Los Alamos Primer (fisica della bomba)",
        type: "sequence",
        steps: 4,
        oppenheimer: true,
      },
      { id: "t-film", name: "Sviluppare pellicola degli esperimenti del settore T", type: "slider", steps: 1 },
      { id: "t-shield", name: "Verificare schermatura del setto principale", type: "wires", steps: 3 },
      { id: "t-ledger", name: "Aggiornare registro giornaliero Main Technical", type: "sequence", steps: 3 },
    ],
    intelSteal: "Registri esperimenti T e copia del Los Alamos Primer",
  },
  {
    id: "gamma",
    name: "Assemblaggio HE",
    theme: "heAssembly",
    x: 72,
    y: 38,
    tasks: [
      { id: "gm-mat", name: "Provare l’innesto delle lenti sui tappeti (Fat Man)", type: "sequence", steps: 4 },
      { id: "gm-xray", name: "Verificare giunzione HE con gammagrafia", type: "slider", steps: 1 },
      {
        id: "gm-torque",
        name: "Serrare bulloni lenti HE a coppia controllata (ft·lb)",
        type: "sequence",
        steps: 1,
      },
      { id: "gm-tape", name: "Applicare nastri di sicurezza sul tappeto HE", type: "wires", steps: 3 },
      { id: "gm-safety", name: "Briefing sicurezza squadra Gamma (checklist)", type: "sequence", steps: 3 },
      { id: "gm-log", name: "Registrare seriali lenti prova Fat Man", type: "sequence", steps: 3 },
    ],
    intelSteal: "Disegni giunzione lenti HE e prove Fat Man",
    spyTasks: [
      {
        id: "spy-fuchs-fatman",
        name: "★ Klaus Fuchs: rubare i documenti su Fat Man (implosione)",
        type: "sequence",
        steps: 1,
        theme: "espionage",
      },
    ],
  },
  {
    id: "sigma",
    name: "Alta energia (Composition B)",
    theme: "explosives",
    x: 28,
    y: 32,
    tasks: [
      { id: "sg-mold", name: "Monitorare raffreddamento colata Composition B", type: "slider", steps: 1 },
      {
        id: "sg-quench",
        name: "Trattare colata Composition B al punto di quench (42 °C)",
        type: "sequence",
        steps: 1,
      },
      { id: "sg-store", name: "Etichettare carichi HE per il settore Sigma", type: "sequence", steps: 4 },
      { id: "sg-scale", name: "Pesare carico Composition B prima dello stoccaggio", type: "slider", steps: 1 },
      { id: "sg-vent", name: "Controllo ventilazione antideflagrazione Sigma", type: "wires", steps: 3 },
    ],
    intelSteal: "Dati colate Composition B e stoccaggio HE",
  },
  {
    id: "delta",
    name: "Supporto HE",
    theme: "heTransfer",
    x: 38,
    y: 40,
    tasks: [
      {
        id: "dl-transfer",
        name: "Spostare tronchetti HE dietro la barriera earth-filled",
        type: "wires",
        steps: 3,
      },
      { id: "dl-log", name: "Annotare movimento HE sul registro Delta", type: "sequence", steps: 3 },
      { id: "dl-guard", name: "Allineare guardia alla barriera earth-filled", type: "wires", steps: 3 },
    ],
    intelSteal: "Manifesti trasferimento esplosivo verso S-Site",
  },
  {
    id: "building-x",
    name: "Ciclotrone",
    theme: "cyclotron",
    x: 78,
    y: 48,
    tasks: [
      { id: "x-beam", name: "Centrare il fascio del ciclotrone sulla camera", type: "wires", steps: 3 },
      {
        id: "x-trim",
        name: "Regolare doppio trim magnetico del ciclotrone sul mirino",
        type: "sequence",
        steps: 1,
      },
      { id: "x-power", name: "Tenere stabile l’alimentazione del magnete", type: "slider", steps: 1 },
      { id: "x-target", name: "Sostituire target del fascio sul ciclotrone", type: "sequence", steps: 3 },
      { id: "x-vac", name: "Portare vuoto nella camera del ciclotrone", type: "slider", steps: 1 },
      { id: "x-log", name: "Archiviare curva corrente magnete settimanale", type: "wires", steps: 3 },
    ],
    intelSteal: "Risultati ciclotrone e misure nucleari",
  },
  {
    id: "building-z",
    name: "Acceleratore Cockcroft-Walton",
    theme: "neutrons",
    x: 55,
    y: 48,
    tasks: [
      { id: "z-hv", name: "Avviare sequenza alta tensione per neutroni", type: "sequence", steps: 4 },
      {
        id: "z-flux",
        name: "Bilanciare tensione e corrente sul flusso neutroni Cockcroft-Walton",
        type: "sequence",
        steps: 1,
      },
      { id: "z-count", name: "Tarare contatore di neutroni sul Cockcroft-Walton", type: "wires", steps: 3 },
      { id: "z-shield", name: "Chiudere barra schermatura corridoi acceleratore", type: "slider", steps: 1 },
    ],
    intelSteal: "Parametri generatore neutroni Cockcroft-Walton",
  },
  {
    id: "building-w",
    name: "Generatore Van de Graaff",
    theme: "vandegraaff",
    x: 48,
    y: 44,
    tasks: [
      { id: "w-belt", name: "Ispezionare cinghia del generatore Van de Graaff", type: "wires", steps: 4 },
      { id: "w-spark", name: "Test scarica controllata Van de Graaff", type: "slider", steps: 1 },
      { id: "w-insulate", name: "Controllo isolamento terminali alta tensione", type: "sequence", steps: 3 },
    ],
    intelSteal: "Calibrazioni Van de Graaff e fasci ad alta tensione",
  },
  {
    id: "building-y",
    name: "Criogenia",
    theme: "cryo",
    x: 42,
    y: 50,
    tasks: [
      { id: "y-n2", name: "Rifornire azoto liquido per i detector", type: "slider", steps: 1 },
      {
        id: "y-dewar-fill",
        name: "Riempire dewar criogenico tra tacche min/max (senza trabocco)",
        type: "sequence",
        steps: 1,
      },
      { id: "y-seal", name: "Controllare tenuta criostato per esperimenti a bassa T", type: "sequence", steps: 3 },
      { id: "y-transfer", name: "Trasferire azoto liquido nel dewar mobile", type: "wires", steps: 3 },
      { id: "y-alarm", name: "Test allarme perdita criogenica", type: "slider", steps: 1 },
    ],
    intelSteal: "Protocolli criogenia e dati detector a bassa temperatura",
  },
  {
    id: "building-u",
    name: "Laboratori chimica e fisica",
    theme: "chemistry",
    x: 58,
    y: 46,
    tasks: [
      { id: "u-mix", name: "Preparare soluzione per diagnostica (ordine reagenti)", type: "sequence", steps: 4 },
      { id: "u-wires", name: "Riparare cablaggio del banco conteggi", type: "wires", steps: 3 },
      { id: "u-plate", name: "Preparare piastra per conteggio beta", type: "slider", steps: 1 },
      { id: "u-acid", name: "Smaltire acido di scarto nella cappe aspiranti", type: "wires", steps: 3 },
      { id: "u-log", name: "Registrare campioni in arrivo da Edificio D", type: "sequence", steps: 3 },
    ],
    intelSteal: "Diari laboratorio chimia/fisica e conteggi",
  },
  {
    id: "building-v",
    name: "Officine meccaniche",
    theme: "machineShop",
    x: 52,
    y: 50,
    spyTasks: [
      {
        id: "spy-rosenberg-forged",
        name: "★ Documento finto per Julius Rosenberg (firma il nome e consegna)",
        type: "sequence",
        steps: 1,
        theme: "espionage",
      },
    ],
    tasks: [
      { id: "v-lathe", name: "Tornire componente in uranio / acciaio per il gadget", type: "slider", steps: 1 },
      { id: "v-tools", name: "Restituire fresa al banco dopo lavorazione HE", type: "sequence", steps: 4 },
      { id: "v-cal", name: "Calibrare tornio per pezzo in uranio depleted", type: "wires", steps: 3 },
      { id: "v-safety", name: "Check paratie e occhiali nell’officina", type: "sequence", steps: 3 },
      { id: "v-ship", name: "Imballare componente tornito per il gadget", type: "slider", steps: 1 },
    ],
    intelSteal: "Disegni tornitura gadget, tamper e componenti",
  },
  {
    id: "building-a",
    name: "Direzione Project Y",
    theme: "director",
    x: 58,
    y: 28,
    oppenheimerHub: true,
    tasks: [
      {
        id: "opp-brief",
        name: "★ Archiviare decisione: bomba a implosione (non più a cannone)",
        type: "sequence",
        steps: 4,
        oppenheimer: true,
      },
      {
        id: "opp-groves",
        name: "★ Inviare rapporto cifrato al generale Groves (Manhattan District)",
        type: "wires",
        steps: 4,
        oppenheimer: true,
      },
      {
        id: "opp-trinity",
        name: "★ Confermare finestra meteo per Trinity (Alamogordo)",
        type: "slider",
        steps: 1,
        oppenheimer: true,
      },
      { id: "a-clear", name: "Aggiornare elenco clearance Q del personale", type: "sequence", steps: 4 },
      { id: "a-mail", name: "Smistare telegrammi classificati per Washington", type: "wires", steps: 3 },
      { id: "a-meeting", name: "Preparare sala riunioni emergenza (caffè e mappe)", type: "sequence", steps: 3 },
      { id: "a-visitor", name: "Registrare visita ispettore Manhattan District", type: "slider", steps: 1 },
    ],
    intelSteal: "Briefing classificati Oppenheimer–Groves e timeline Trinity",
  },
  {
    id: "building-q",
    name: "Health Group",
    theme: "health",
    x: 46,
    y: 54,
    tasks: [
      {
        id: "q-scan",
        name: "Misurare dose radiologica su un tecnico (dosimetro analogico)",
        type: "sequence",
        steps: 1,
      },
      { id: "q-kit", name: "Preparare kit urgenze per esposizione chimica", type: "sequence", steps: 3 },
      { id: "q-badge", name: "Sostituire badge dosimetria di un tecnico", type: "sequence", steps: 3 },
      { id: "q-decon", name: "Prova doccia decontaminazione Health Group", type: "wires", steps: 3 },
    ],
    intelSteal: "Registri dose radiologica (copertura per muoversi nel lab)",
  },
  {
    id: "boiler",
    name: "Centrale termica n.2",
    theme: "boiler",
    x: 50,
    y: 54,
    tasks: [
      { id: "bo-pressure", name: "Regolare pressione vapore per riscaldare i laboratori", type: "slider", steps: 1 },
      { id: "bo-coal", name: "Annotare consumo combustibile della centrale n.2", type: "sequence", steps: 3 },
      { id: "bo-water", name: "Controllo qualità acqua alimentazione caldaia", type: "wires", steps: 3 },
      { id: "bo-log", name: "Registro turni operatore centrale n.2", type: "sequence", steps: 3 },
    ],
    intelSteal: "Schemi rete vapore (utilità per mappare il sito)",
  },
  {
    id: "foundry",
    name: "Fonderia",
    theme: "foundry",
    x: 18,
    y: 78,
    tasks: [
      { id: "fo-pour", name: "Colare lega per pezzi di supporto al progetto", type: "slider", steps: 1 },
      { id: "fo-mold", name: "Preparare forma di sabbia per getto", type: "sequence", steps: 3 },
      { id: "fo-cool", name: "Monitorare raffreddamento getto in fonderia", type: "slider", steps: 1 },
    ],
    intelSteal: "Specifiche leghe fonderia per componenti del progetto",
  },
  {
    id: "warehouse",
    name: "Magazzini",
    theme: "warehouse",
    x: 22,
    y: 42,
    tasks: [
      { id: "wh-sort", name: "Smistare casse classificate verso plutonio e officine", type: "sequence", steps: 4 },
      { id: "wh-inventory", name: "Inventariare barre uranio depleted e materiali", type: "wires", steps: 3 },
      { id: "wh-seal", name: "Sigillare cassa classificata per convoglio", type: "slider", steps: 1 },
      { id: "wh-crane", name: "Inventario carrello gru magazzino", type: "sequence", steps: 3 },
    ],
    intelSteal: "Inventario materiali classificati e uranio depleted",
  },
  {
    id: "px",
    name: "Post Exchange (Tech Area)",
    theme: "px",
    x: 48,
    y: 22,
    tasks: [
      { id: "px-stock", name: "Rifornire il PX all’ingresso della Tech Area", type: "sequence", steps: 4 },
      { id: "px-ration", name: "Distribuire razioni speciali al personale Q-clearance", type: "wires", steps: 3 },
      { id: "px-order", name: "Trasmettere ordine materiali da Santa Fe", type: "sequence", steps: 3 },
    ],
    intelSteal: "Liste personale autorizzato all’ingresso Tech Area",
  },
  {
    id: "dispensary",
    name: "Ambulatorio e laboratorio medico",
    theme: "medical",
    x: 42,
    y: 26,
    tasks: [
      { id: "med-lab", name: "Analizzare campione sangue (lavoro con esplosivi/TNT)", type: "wires", steps: 4 },
      { id: "med-shower", name: "Testare doccia emergenza chimica", type: "slider", steps: 1 },
      { id: "med-xray", name: "Archiviare lastra controllo torace (TNT)", type: "sequence", steps: 3 },
      { id: "med-ttl", name: "Test urine TNT su tecnico esplosivisti", type: "wires", steps: 3 },
    ],
    intelSteal: "Referti medici con nomi di scienziati chiave",
  },
  {
    id: "motor-pool",
    name: "Parco veicoli",
    theme: "motorPool",
    x: 55,
    y: 20,
    tasks: [
      { id: "mp-fuel", name: "Controllare benzina per il convoglio verso S-Site", type: "slider", steps: 1 },
      { id: "mp-tire", name: "Ispezionare camion per trasporto lenti HE (strade sterrate)", type: "sequence", steps: 4 },
      { id: "mp-route", name: "Pianificare percorso convoglio verso V-Site", type: "wires", steps: 3 },
      { id: "mp-chain", name: "Montare catene su camion (neve sul mesa)", type: "sequence", steps: 3 },
    ],
    intelSteal: "Orari convogli verso S-Site e V-Site",
  },
  {
    id: "trinity-ground",
    name: "Trinity · cratere (recupero)",
    theme: "motorPool",
    x: 32,
    y: 72,
    tasks: [
      {
        id: "trinity-sand-cleanup",
        name: "★ Dopo Trinity: raccogliere la sabbia radioattiva (verde) nel deserto",
        type: "sequence",
        steps: 1,
        oppenheimer: true,
      },
    ],
    intelSteal: "",
  },
  {
    id: "post-office",
    name: "Ufficio postale (censura)",
    theme: "postOffice",
    x: 82,
    y: 28,
    tasks: [
      {
        id: "po-mail",
        name: "Censurare lettere (indirizzo: PO Box 1663, Santa Fe)",
        type: "wires",
        steps: 3,
      },
      { id: "po-stamp", name: "Applicare timbro censura PO Box 1663", type: "sequence", steps: 3 },
      { id: "po-pouch", name: "Preparare sacco diplomatico per Washington", type: "slider", steps: 1 },
    ],
    intelSteal: "Campione lettere censurate (indizi su Trinity e implosione)",
  },
  {
    id: "commissary",
    name: "Mensa (Commissary)",
    theme: "commissary",
    x: 92,
    y: 35,
    tasks: [
      { id: "co-stock", name: "Rifornire mensa per il turno di notte al lab", type: "sequence", steps: 4 },
      { id: "co-milk", name: "Controllo temperatura latte in cella frigo", type: "slider", steps: 1 },
      { id: "co-mess", name: "Turno servizio mensa scienziati (notte)", type: "wires", steps: 3 },
    ],
    intelSteal: "Turni mensa (pattern presenza al Hill)",
  },
  {
    id: "pass-p",
    name: "Ufficio pass",
    theme: "passOffice",
    x: 64,
    y: 46,
    tasks: [
      {
        id: "gate-boolean-check",
        name: "★ Sorveglianza ingresso Tech Area: dogana booleana (PASS / DENY)",
        type: "sequence",
        steps: 1,
        oppenheimer: true,
      },
    ],
    intelSteal: "Registro badge e clearance Q",
  },
  {
    id: "pond",
    name: "Ashley Pond",
    theme: "pond",
    x: 85,
    y: 22,
    tasks: [
      { id: "pond-water", name: "Prelevare campione acqua (ex Ranch School / ricreazione)", type: "slider", steps: 1 },
      { id: "pond-ph", name: "Analisi pH acqua Ashley Pond", type: "wires", steps: 3 },
      { id: "pond-trash", name: "Ritiro rifiuti area ricreazione vicino al lago", type: "sequence", steps: 3 },
    ],
    intelSteal: "Note sorveglianza area ricreativa (copertura movimenti sul Hill)",
  },
  {
    id: "cleaners",
    name: "Lavanderia",
    theme: "laundry",
    x: 75,
    y: 18,
    tasks: [
      { id: "cl-laundry", name: "Consegnare camici puliti al padiglione plutonio", type: "sequence", steps: 3 },
      { id: "cl-acid", name: "Trattare camici contaminati da acidi", type: "wires", steps: 3 },
      { id: "cl-count", name: "Conteggio giornaliero camici in circolazione", type: "sequence", steps: 3 },
    ],
    intelSteal: "Registro camici e accessi ai padiglioni contaminati",
  },
  {
    id: "zia",
    name: "Officine Zia Company",
    theme: "maintenance",
    x: 88,
    y: 72,
    tasks: [
      { id: "zia-fix", name: "Riparare linea elettrica del padiglione (appalto Zia)", type: "wires", steps: 4 },
      { id: "zia-pipe", name: "Riparare tubatura vapore verso i laboratori", type: "sequence", steps: 3 },
      { id: "zia-meter", name: "Lettura contatori elettrici settore Zia", type: "slider", steps: 1 },
    ],
    intelSteal: "Piani elettrici padiglioni (Zia Company)",
  },
];

/** Tutti i task in lista piatta (per UI Among Us) */
function allTasks() {
  const out = [];
  for (const loc of LOCATIONS) {
    for (const t of loc.tasks) {
      out.push({ ...t, locationId: loc.id, locationName: loc.name });
    }
  }
  return out;
}

const WIN_TASK_COUNT = 4;

function criticalTasksComplete(completedSet) {
  return CRITICAL_TASK_IDS.every((id) => completedSet.has(id));
}

/** Missioni extra alla Direzione Project Y (documenti di massima classifica) */
/** Missioni spia dedicate (Gamma / Officina V / Main Technical) — vedi anche `spyTasks` sui luoghi */
const SPY_INTEL_TASKS = [
  {
    id: "spy-fuchs-fatman",
    name: "Klaus Fuchs — documenti Fat Man (implosione)",
    type: "sequence",
    steps: 1,
    theme: "espionage",
  },
  {
    id: "spy-rosenberg-forged",
    name: "Julius Rosenberg — documento falsificato e consegna",
    type: "sequence",
    steps: 1,
    theme: "espionage",
  },
  {
    id: "spy-seborer-detonation",
    name: "Oscar Seborer — innesco e sistema di detonazione",
    type: "sequence",
    steps: 1,
    theme: "espionage",
  },
];

const SPY_DISPATCH_WIN = 3;

const LOCATION_DESCS = {
  "building-d":
    "Padiglione di chimica e metallurgia: qui si purifica e si lavora il plutonio per i noccioli (pit) delle bombe a implosione.",
  "building-t":
    "Primo grande edificio tecnico del lab: cuore iniziale degli esperimenti e dei registri del Project Y.",
  gamma:
    "Zona prove esplosivo ad alta energia (HE): assemblaggio di prova delle lenti per Fat Man su tappeti ammortizzati.",
  sigma:
    "Edificio legato alle lavorazioni con esplosivo Composition B e al controllo delle colate prima dello S-Site.",
  delta:
    "Supporto HE: deposito e spostamento materiali esplosivi dietro barriere in terra (earth-filled).",
  "building-x":
    "Ciclotrone: acceleratori di particelle per misure nucleari e supporto alla fisica del progetto.",
  "building-z":
    "Acceleratore Cockcroft-Walton: generazione di neutroni per esperimenti.",
  "building-w": "Generatore Van de Graaff: fisica nucleare e test con fasci ad alta tensione.",
  "building-y": "Criogenia: azoto liquido e basse temperature per detector e esperimenti.",
  "building-u": "Laboratori di chimica e fisica: elettronica, conteggi e preparazione campioni.",
  "building-v":
    "Officine meccaniche: tornitura e pezzi su misura per gadget, tamper e attrezzature.",
  "building-a":
    "Direzione e amministrazione del laboratorio: clearance, rapporti con il Manhattan District e decisioni di progetto.",
  "building-q": "Health Group: sorveglianza sanitaria, dose radiologica e pronto soccorso.",
  boiler:
    "Centrale termica n.2: vapore e riscaldamento per i padiglioni della Technical Area.",
  foundry: "Fonderia: fusione e leghe per componenti metallici del sito.",
  warehouse: "Magazzini: materiali classificati, uranio depleted e scorte per tutto il plateau.",
  px: "Post Exchange tecnico: negozio all’ingresso della Tech Area per il personale autorizzato.",
  dispensary:
    "Ambulatorio e laboratorio medico: controlli su chi lavora con chimici ed esplosivi.",
  "motor-pool": "Parco veicoli: trasporti verso S-Site, V-Site e strade del mesa.",
  "trinity-ground":
    "Zona del test Trinity (1945): recupero detriti e sabbia contaminata nel deserto di Jornada del Muerto.",
  "post-office":
    "Ufficio postale con censura: tutta la corrispondenza passa da qui (spesso indirizzata a PO Box 1663, Santa Fe).",
  commissary: "Mensa e negozio alimentari per famiglie e personale del «Hill».",
  "pass-p": "Ufficio pass: controllo badge per entrare nella recinzione della Technical Area.",
  pond:
    "Ashley Pond: lago della ex Los Alamos Ranch School; oggi area ricreativa vicino al centro del sito.",
  cleaners: "Lavanderia: camici e indumenti per chi entra nei laboratori contaminati.",
  zia: "Officine Zia Company: manutenzione edifici, elettricità e idraulica del posto.",
};

LOCATIONS.forEach((loc) => {
  loc.desc = LOCATION_DESCS[loc.id] || "";
});

window.MP_DATA = {
  ROLES,
  LOCATIONS,
  allTasks,
  WIN_TASK_COUNT,
  CRITICAL_TASK_IDS,
  MEETING_QUOTES,
  criticalTasksComplete,
  SPY_INTEL_TASKS,
  SPY_DISPATCH_WIN,
};
