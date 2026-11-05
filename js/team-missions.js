// Mission scenes are fictional puzzles, not reconstructions of laboratory procedures.
export const TEAMS = {
  personnel: {
    name: "Personale",
    subtitle: "Quattro incarichi. Un laboratorio da far funzionare.",
    color: "#8bd5c2",
  },
  spies: {
    name: "Spie",
    subtitle: "Tre operazioni. Una rete di documenti da completare.",
    color: "#d4b0f4",
  },
};
const source = (name, url) => ({ name, url });
const safety = source(
  "Los Alamos Historical Society · The Slotin Accident",
  "https://losalamoshistory.org/the-slotin-accident-inside-the-archives/",
);
const doe = source(
  "DOE · Establishing Los Alamos",
  "https://www.osti.gov/opennet/manhattan-project-history/Events/1942-1945/establishing_los_alamos.htm",
);
const trinity = source(
  "National Park Service · Trinity",
  "https://www.nps.gov/mapr/learn/historyculture/trinity.htm",
);
const fuchs = source(
  "National Park Service · Klaus Fuchs",
  "https://www.nps.gov/people/manhattan-project-scientists-klaus-fuchs.htm",
);
const rosenberg = source(
  "FBI · Atom Spy Case / Rosenbergs",
  "https://www.fbi.gov/history/cases-and-criminals/atom-spy-caserosenbergs",
);
const seborer = source(
  "Studies in Intelligence · Seborer (2019)",
  "https://www.cia.gov/resources/csi/static/Project-SOLO-and-Seborers.pdf",
);
const base = { chapter: 0, duration: "1–2 min" };
const route = {
  activity: "route",
  size: 4,
  start: 0,
  goal: 15,
  blocked: [2, 5, 6, 12],
  answer: [0, 4, 8, 9, 10, 11, 15],
};
const calibration = (target, label) => ({
  activity: "calibrate",
  prompt: label,
  target,
  answer: target,
  validation: "calibrate",
  hint: "Porta il cursore nella fascia evidenziata, poi registra il segnale.",
  feedback: "Campione stabile registrato.",
});
const sequence = (prompt, options, answer, hint) => ({
  interaction: "sequence",
  prompt,
  options,
  answer,
  hint,
  feedback: "Sequenza completata.",
});
export const TEAM_MISSIONS = [
  {
    ...base,
    id: "demon-core-stabilize",
    team: "personnel",
    place: "physics",
    title: "Demon Core · il cacciavite e le tre misure",
    date: "1945–1946 · ricostruzione simbolica",
    kind: "Banco strumenti",
    intro:
      "Un pannello didattico ricorda i due incidenti (Daghlian 1945, Slotin 1946). Tieni fermo il «cacciavite» sulla scala colorata e registra tre misure stabili: il banco è inventato e non controlla materiali nucleari.",
    fact: "Gli incidenti di Harry Daghlian (1945) e Louis Slotin (21 maggio 1946) furono distinti. Quello di Slotin avvenne dopo la guerra; non fu una ripetizione della stessa disposizione di mattoni.",
    adaptation:
      "Le tre tarature sono un gioco astratto di precisione. Non rappresentano una soglia di criticità, una geometria o una procedura reale.",
    source: safety,
    steps: [
      calibration(35, "Misura 1 · stabilizza il cacciavite sulla fascia 35"),
      calibration(65, "Misura 2 · stabilizza il cacciavite sulla fascia 65"),
      calibration(50, "Misura 3 · tieni il cacciavite fermo sulla fascia 50"),
    ],
  },
  {
    ...base,
    id: "pu-glovebox-shuttle",
    team: "personnel",
    place: "computing",
    title: "Glove box · plutonio e uranio",
    date: "Anni del progetto · scena inventata",
    kind: "Manipolazione",
    intro:
      "Nel glove box hai due metalli didattici: plutonio (Pu) e uranio (U). Il Pu emette particelle alfa: va preso con le pinze, nel box chiuso, perché la polvere è pericolosa se inalata. L’uranio resta sul banco. Campioni, pinze e dose sono inventati.",
    fact: "A Los Alamos si lavorarono sia uranio sia plutonio. Il plutonio, in forma metallica, si manipolava in glove box per contenere la polvere; il progetto usò uranio per Little Boy e plutonio per Fat Man.",
    adaptation:
      "Le etichette Pu/U, le pinze e la dose sono un puzzle. Non insegna a maneggiare metalli nucleari né descrive una procedura di laboratorio reale.",
    source: doe,
    steps: [
      {
        activity: "collect",
        validation: "set",
        prompt: "Preleva i sei campioni di plutonio (Pu)",
        banner: "GLOVE BOX · PINZE SUL Pu",
        instruction:
          "Prendi solo i campioni Pu. L’uranio (U) e le caselle vuote restano dove sono: toccarli aumenta l’esposizione simbolica.",
        size: 4,
        labels: [
          "Pu",
          "U",
          "Pu",
          "",
          "U",
          "Pu",
          "",
          "U",
          "",
          "Pu",
          "U",
          "Pu",
          "",
          "U",
          "",
          "Pu",
        ],
        targets: [0, 2, 5, 9, 11, 15],
        answer: [0, 2, 5, 9, 11, 15],
        hint: "Le caselle Pu sono evidenziate. Non toccare le U.",
        feedback: "I sei campioni di plutonio sono nel contenitore del box.",
      },
      calibration(42, "Pinze sul Pu · tieni la massa nella fascia 42"),
      sequence(
        "Chiudi il glove box nell’ordine: guanti → filtro HEPA → contenitore sigillato",
        ["Filtro HEPA", "Contenitore sigillato", "Guanti"],
        [2, 0, 1],
        "Prima i guanti, poi l’aria filtrata, infine il contenitore.",
      ),
    ],
  },
  {
    ...base,
    id: "trinity-sand-cleanup",
    team: "personnel",
    place: "briefing",
    title: "Trinity · pulizia del deserto",
    date: "Dopo il 16 luglio 1945 · scena inventata",
    kind: "Ricognizione",
    intro:
      "Il test Trinity è già avvenuto, lontano da Los Alamos. Stai ripulendo il deserto: raccogli solo la sabbia «strana» (contaminata) perché non si sparga in altre parti del mondo. Lascia la sabbia normale.",
    fact: "Il test Trinity si svolse il 16 luglio 1945 nel New Mexico, in un sito distinto da Los Alamos. La ricaduta radioattiva interessò anche le comunità vicine e sottovento.",
    adaptation:
      "Scegliere la sabbia diversa è un puzzle. Non ricostruisce una bonifica storica né indica il colore reale della sabbia.",
    source: trinity,
    steps: [
      {
        activity: "collect",
        validation: "set",
        prompt: "Raccogli i sei pezzi di sabbia diversa",
        banner: "DESERTO · POST-TRINITY · NON SPARGERE LA RICADUTA",
        instruction:
          "Stai pulendo il deserto dopo Trinity, perché la contaminazione non raggiunga altre parti del mondo. Scegli solo la sabbia «strana» (contrassegni). La sabbia ordinaria va lasciata.",
        size: 4,
        targets: [1, 3, 6, 8, 10, 14],
        answer: [1, 3, 6, 8, 10, 14],
        hint: "Le caselle da raccogliere hanno un punto luminoso: è la sabbia diversa.",
        feedback: "La sabbia diversa è nel sacco. Il resto del deserto resta al suo posto.",
      },
      {
        prompt: "Perché raccogli solo la sabbia diversa?",
        options: [
          "Perché Trinity e Los Alamos erano lo stesso sito",
          "Per contenere la contaminazione e non spargerla nel resto del mondo",
          "Perché il verde era un segnale naturale di sicurezza",
        ],
        answer: 1,
        hint: "Il briefing parla di pulizia del deserto dopo il test.",
        feedback: "Rapporto archiviato: la raccolta serve a non spargere la ricaduta.",
      },
    ],
  },
  {
    ...base,
    id: "gate-boolean-check",
    team: "personnel",
    place: "arrival",
    title: "Ingresso · pass e permessi",
    date: "Anni del progetto · regola di gioco",
    kind: "Controllo accessi",
    intro:
      "Otto visitatori aspettano al cancello. PASSA soltanto chi ha badge valido, visita autorizzata e nessun blocco sul registro. La regola resta sempre visibile.",
    fact: "Los Alamos fu un insediamento segreto ad accesso controllato durante il Progetto Manhattan. La vita del laboratorio si svolgeva in un contesto di sicurezza militare.",
    adaptation:
      "Persone, schede e regola booleana sono inventate. Non usiamo la successiva denominazione Q-clearance per attribuirla indistintamente al periodo bellico.",
    source: doe,
    steps: [
      [true, true, false],
      [true, false, false],
      [false, true, false],
      [true, true, true],
      [false, false, true],
      [true, true, false],
      [true, false, true],
      [true, true, false],
    ].map((flags, i) => ({
      activity: "gate",
      prompt: `Visitatore ${i + 1} di 8 · controlla il pass`,
      visitor: [
        "Elena",
        "Marco",
        "Nora",
        "Leo",
        "Amelia",
        "Oscar",
        "Rita",
        "Bruno",
      ][i],
      flags,
      options: ["PASSA", "FERMA"],
      answer: flags[0] && flags[1] && !flags[2] ? 0 : 1,
      hint: "Servono badge valido E visita autorizzata E nessun blocco.",
      feedback: "Decisione registrata.",
    })),
  },
  {
    ...base,
    id: "spy-fuchs-fatman",
    team: "spies",
    place: "library",
    title: "Fuchs · la copia del fascicolo",
    date: "1944–1945 · scena di finzione",
    kind: "Copia e copertura",
    intro:
      "Copia un fascicolo di copertura mentre la sentinella percorre il corridoio. Puoi fermare la macchina con Nascondi e ripartire quando il passaggio è libero.",
    fact: "Klaus Fuchs lavorò a Los Alamos come parte della missione britannica e trasmise informazioni all’Unione Sovietica. Fu arrestato nel Regno Unito nel 1950.",
    adaptation:
      "Fascicolo, sentinella e copiatrice sono una scena inventata. Il documento non contiene disegni, dati o istruzioni per armi.",
    source: fuchs,
    steps: [
      {
        activity: "copy",
        minDuration: 8000,
        prompt: "Completa la copia senza attirare la sentinella",
        answer: 0,
        hint: "Quando il corridoio si illumina, premi Nascondi. Riprendi al segnale libero.",
        feedback: "Copia di copertura completata.",
      },
      sequence(
        "Prepara la busta nell’ordine indicato: copia → sigillo → consegna",
        ["Sigillo", "Consegna", "Copia"],
        [2, 0, 1],
        "Segui i tre passaggi scritti sopra.",
      ),
    ],
  },
  {
    ...base,
    id: "spy-rosenberg-forged",
    team: "spies",
    place: "radio",
    title: "Rosenberg · una consegna di copertura",
    date: "Scena inventata · contesto storico 1951",
    kind: "Documento e timbro",
    intro:
      "Compila un modulo di fantasia, allinea il timbro al centro e raggiungi il punto di consegna. La missione non descrive un incarico documentato di Julius Rosenberg a Los Alamos.",
    fact: "Julius Rosenberg fu condannato nel 1951 nel caso di spionaggio atomico legato anche a David Greenglass. La vicenda giudiziaria è distinta dalla scena giocabile inventata qui.",
    adaptation:
      "Destinatario, timbro e percorso sono elementi di un puzzle narrativo. Il gioco non attribuisce a Rosenberg un ruolo di dipendente del laboratorio.",
    source: rosenberg,
    steps: [
      {
        activity: "form",
        validation: "text",
        prompt: "Scrivi il destinatario indicato sulla scheda",
        recipient: "Julius Rosenberg",
        answer: "Julius Rosenberg",
        hint: "Il nome sulla scheda è Julius Rosenberg.",
        feedback: "Destinatario registrato.",
      },
      {
        activity: "stamp",
        validation: "stamp",
        prompt: "Centra il timbro sulla croce del modulo",
        answer: [50, 50],
        hint: "Porta entrambi i cursori a 50. Puoi usare anche le frecce della tastiera.",
        feedback: "Timbro allineato.",
      },
      {
        ...route,
        validation: "route",
        prompt: "Porta la busta da IN a OUT",
        hint: "Tocca una casella adiacente libera.",
        feedback: "Consegna narrativa completata.",
      },
    ],
  },
  {
    ...base,
    id: "spy-seborer-detonation",
    team: "spies",
    place: "physics",
    title: "Seborer · l’archivio dei simboli",
    date: "Contesto del progetto · fonti pubblicate nel 2019",
    kind: "Sequenza e invio",
    intro:
      "Ricostruisci una pagina usando soltanto simboli astratti, poi prepara l’invio. Non ci sono circuiti reali o schemi di detonazione nel fascicolo.",
    fact: "Uno studio di Klehr e Haynes pubblicato in Studies in Intelligence nel 2019 ha ricostruito elementi della vicenda di Oscar Seborer e dello spionaggio sovietico a Los Alamos.",
    adaptation:
      "Sequenze, pagina e invio sono inventati. I simboli non rappresentano componenti, collegamenti o tempi di un ordigno.",
    source: seborer,
    steps: [
      sequence(
        "Ricopia la riga: CERCHIO → TRIANGOLO → QUADRATO",
        ["QUADRATO", "CERCHIO", "TRIANGOLO"],
        [1, 2, 0],
        "Confronta i nomi con la riga da ricopiare.",
      ),
      sequence(
        "Archivia nell’ordine: indice → pagina → busta",
        ["Pagina", "Busta", "Indice"],
        [2, 0, 1],
        "L’indice viene prima della pagina; la busta chiude il fascicolo.",
      ),
      {
        prompt: "Il fascicolo è completo. A chi invii il rapporto di gioco?",
        options: [
          "Al contatto della rete",
          "Al registro del Personale",
          "A nessuno",
        ],
        answer: 0,
        hint: "Stai completando la missione delle Spie.",
        feedback: "Rapporto inviato. Operazione completata.",
      },
    ],
  },
];
export const missionsFor = (team) =>
  TEAM_MISSIONS.filter((e) => e.team === team);
