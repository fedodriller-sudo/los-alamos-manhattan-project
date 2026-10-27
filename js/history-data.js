// Historical framing is sourced; player actions and dialogue are explicitly fictional.
export const CHAPTERS = [
  {
    year: "1943",
    title: "Una città segreta",
    subtitle: "Arrivare, orientarsi, condividere le conoscenze.",
  },
  {
    year: "1944",
    title: "Il lavoro invisibile",
    subtitle: "Calcolatrici, schede e piccoli imprevisti quotidiani.",
  },
  {
    year: "1945",
    title: "Prima dell’alba",
    subtitle: "Raccogliere i risultati. Comprenderne le conseguenze.",
  },
];
export const PLACES = [
  { id: "arrival", name: "Ingresso", x: 49, y: 75, number: "01" },
  { id: "briefing", name: "Piazzale", x: 45, y: 39, number: "02" },
  { id: "library", name: "Biblioteca", x: 77, y: 70, number: "03" },
  { id: "computing", name: "Sala calcoli", x: 23, y: 30, number: "04" },
  { id: "radio", name: "Comunicazioni", x: 76, y: 30, number: "05" },
  { id: "physics", name: "Ciclotrone", x: 23, y: 65, number: "06" },
];
const doe = {
  name: "DOE · Establishing Los Alamos",
  url: "https://www.osti.gov/opennet/manhattan-project-history/Events/1942-1945/establishing_los_alamos.htm",
};
const serber = {
  name: "National Park Service · Robert Serber",
  url: "https://www.nps.gov/people/manhattan-project-scientists-robert-serber.htm",
};
const computing = {
  name: "History paper · Los Alamos Computing Facility (2021)",
  url: "https://arxiv.org/abs/2103.05705",
};
const fence = {
  name: "LANL · The Vault, 2022",
  url: "https://cdn.lanl.gov/files/The-Vault-2022.pdf",
};
const trinity = {
  name: "National Park Service · Trinity",
  url: "https://www.nps.gov/mapr/learn/historyculture/trinity.htm",
};
const displacement = {
  name: "National Park Service · Los Alamos: Displacement",
  url: "https://www.nps.gov/mapr/learn/historyculture/losalamos-displacement.htm",
};
const step = (prompt, hint, options, answer, feedback) => ({
  prompt,
  hint,
  options,
  answer,
  feedback,
});
export const EVENTS = [
  {
    id: "arrival",
    chapter: 0,
    place: "arrival",
    title: "Una strada verso la mesa",
    date: "Primavera 1943",
    kind: "Logistica",
    duration: "2 min",
    intro:
      "Il tuo primo turno comincia tra casse e bagagli. Il laboratorio sta prendendo forma: aiuta il personale a orientarsi.",
    fact: "Nel 1943, persone e apparecchiature raggiunsero Los Alamos passando da Santa Fe e percorrendo la strada che saliva alla mesa. Il laboratorio riunì ricercatori provenienti da molti istituti.",
    adaptation:
      "Il registro di consegna e il tuo incarico sono inventati. La disposizione della mappa non riproduce la Technical Area storica.",
    source: doe,
    steps: [
      step(
        "Quale destinazione scrivi sul registro delle apparecchiature?",
        "Il centro di ricerca sulla mesa aveva il nome in codice Project Y.",
        [
          "Project Y · Los Alamos",
          "Centro di Chicago",
          "Porto di San Francisco",
        ],
        0,
        "Corretto: il materiale deve raggiungere il nuovo laboratorio.",
      ),
      step(
        "Un ricercatore non trova il gruppo di lavoro. Dove lo accompagni?",
        "La collaborazione scientifica richiedeva un luogo comune di confronto.",
        ["Al deposito bagagli", "Al briefing scientifico", "Fuori dal campo"],
        1,
        "Il briefing aiuta i nuovi arrivati a entrare nel lavoro del laboratorio.",
      ),
    ],
  },
  {
    id: "primer",
    chapter: 0,
    place: "briefing",
    title: "Cinque lezioni per cominciare",
    date: "Aprile 1943",
    kind: "Ascolto",
    duration: "2 min",
    intro:
      "Ti siedi in fondo alla sala. Robert Serber presenta ai nuovi arrivati il quadro generale del progetto. Rimetti in ordine gli appunti introduttivi.",
    fact: "Robert Serber tenne cinque lezioni introduttive nell’aprile 1943. Le note, raccolte nel Los Alamos Primer, permisero ai nuovi ricercatori di acquisire una base comune.",
    adaptation:
      "Gli appunti selezionabili sono una semplificazione educativa; non sono citazioni o istruzioni tecniche del Primer.",
    source: serber,
    steps: [
      step(
        "Quale foglio metti all’inizio degli appunti?",
        "Un’introduzione parte dallo scopo del lavoro.",
        [
          "Elenco dei bagagli",
          "Risultati ancora da ottenere",
          "Obiettivi generali del progetto",
        ],
        2,
        "Prima il quadro generale, poi le domande da affrontare.",
      ),
      step(
        "A chi consegni una copia degli appunti?",
        "Le lezioni servivano a orientare chi entrava nel gruppo.",
        [
          "Ai nuovi membri dello staff",
          "A un giornale locale",
          "Solo a chi era già presente",
        ],
        0,
        "Una base comune rende più semplice collaborare.",
      ),
    ],
  },
  {
    id: "library",
    chapter: 0,
    place: "library",
    title: "Il laboratorio ha una memoria",
    date: "1943 · biblioteca tecnica",
    kind: "Archivio",
    duration: "2 min",
    intro:
      "La biblioteca di Charlotte Serber ha bisogno di un registro chiaro. Un rapporto utile conta poco se nessuno riesce a ritrovarlo.",
    fact: "Charlotte Serber guidò la biblioteca tecnica di Los Alamos. Secondo il National Park Service, fu l’unica donna a dirigere un gruppo durante il periodo bellico.",
    adaptation:
      "Cataloghi, titoli e procedura di prestito mostrati nel minigioco sono inventati, ispirati al lavoro di una biblioteca scientifica.",
    source: serber,
    steps: [
      step(
        "Quale etichetta rende più facile ritrovare un rapporto?",
        "Una scheda deve distinguere un documento dagli altri.",
        ["Importante!", "Autore · titolo · data", "Da leggere"],
        1,
        "Un riferimento preciso aiuta a ritrovare il documento.",
      ),
      step(
        "Dopo il prestito, che cosa annoti?",
        "Un registro mantiene traccia di dove si trova un documento.",
        [
          "Nome del lettore e riferimento del rapporto",
          "Solo il colore della copertina",
          "Nulla: basta ricordarselo",
        ],
        0,
        "Il documento ora può essere rintracciato.",
      ),
    ],
  },
  {
    id: "calculators",
    chapter: 1,
    place: "computing",
    title: "La calcolatrice si è fermata",
    date: "Durante la guerra · episodio non datato al giorno",
    kind: "Officina",
    duration: "2 min",
    intro:
      "Le calcolatrici si guastano, e mandarle fuori dal laboratorio rallenta il lavoro. Feynman e Metropolis improvvisano un servizio di riparazione. Entra nel loro piccolo laboratorio.",
    fact: "Feynman e Metropolis confrontavano una calcolatrice funzionante con una guasta per capirne i meccanismi. L’amministrazione interruppe questo servizio informale; quando le macchine disponibili diminuirono, ne chiese la ripresa.",
    adaptation:
      "Le verifiche sono inventate e non simulano una riparazione autentica. L’episodio è collocato nel capitolo 1944 per ritmo narrativo, non per una data accertata.",
    source: {
      name: "LANL · Computing and Computers, 1983",
      url: "https://permalink.lanl.gov/object/tr?what=info%3Alanl-repo%2Flareport%2FLA-UR-83-5073",
    },
    additionalSources: [computing],
    steps: [
      step(
        "Come cerchi il problema senza un servizio di assistenza sul posto?",
        "Metropolis raccontò che confrontavano i movimenti di una macchina funzionante con quelli di una guasta.",
        [
          "Confronti la macchina guasta con una funzionante",
          "Copia un risultato a caso",
          "Archivia la macchina senza controllarla",
        ],
        0,
        "Era proprio il metodo di confronto ricordato da Metropolis.",
      ),
      step(
        "Dopo il confronto, che cosa lasci al gruppo?",
        "Chi riprende il lavoro deve sapere che cosa è stato verificato.",
        [
          "Cancelli gli appunti",
          "La lasci su una sedia",
          "Annoti il controllo e confronti il risultato",
        ],
        2,
        "Il gruppo sa quale macchina deve essere controllata e quali risultati hai confrontato.",
      ),
    ],
  },
  {
    id: "cards",
    chapter: 1,
    place: "computing",
    title: "Il turno delle schede",
    date: "1944 · calcolo meccanizzato",
    kind: "Sequenza",
    duration: "2 min",
    intro:
      "Sul tavolo arrivano pacchi di schede perforate. Il gruppo di calcolo deve organizzare un flusso ordinato, senza confondere i lotti.",
    fact: "A Los Alamos si usarono macchine IBM a schede perforate insieme al calcolo manuale. Il lavoro dipendeva da operatori e operatrici e dall’organizzazione dei passaggi tra le macchine.",
    adaptation:
      "Le tre fasi e i lotti A/B sono simbolici. Non rappresentano un calcolo del progetto o una procedura originale IBM.",
    source: computing,
    steps: [
      step(
        "Quale lotto fai passare per primo?",
        "Il registro di questo esercizio dice: A prima di B.",
        ["Lotto B", "Lotto A", "Mescola A e B"],
        1,
        "Il lotto A mantiene l’ordine previsto nel registro.",
      ),
      step(
        "Completa la sequenza: prepara → elabora → …",
        "Prima di archiviare, un risultato deve essere controllato.",
        ["Distruggi", "Invia senza leggere", "Verifica"],
        2,
        "Il controllo finale è parte del lavoro, non un passaggio in più.",
      ),
    ],
  },
  {
    id: "fence",
    chapter: 1,
    place: "arrival",
    title: "Uno scherzo alla sentinella",
    date: "Durante la guerra · ricordo successivo",
    kind: "Aneddoto",
    duration: "2 min",
    intro:
      "Una storia curiosa circola al campo: Feynman ha trovato un modo per mettere in difficoltà il conteggio degli ingressi. Tu aiuti a registrare la segnalazione.",
    fact: "In un ricordo successivo, Feynman raccontò di uscire dal cancello e rientrare attraverso un’apertura nella recinzione, confondendo la sentinella. LANL riporta l’aneddoto nella rivista The Vault.",
    adaptation:
      "Il dialogo e il modulo sono inventati. Il ricordo non fornisce qui una data esatta; la posizione nel capitolo 1944 è narrativa.",
    source: fence,
    steps: [
      step(
        "Che cosa segnali nel registro?",
        "Il problema è la differenza tra il passaggio registrato e quello reale.",
        [
          "Un accesso non registrato dalla recinzione",
          "Un guasto alla calcolatrice",
          "Un libro smarrito",
        ],
        0,
        "La segnalazione riguarda il controllo degli accessi.",
      ),
      step(
        "Come descrivi oggi questo episodio nel diario?",
        "Un aneddoto raccontato dopo i fatti non è un verbale contemporaneo.",
        [
          "Una scena filmata quel giorno",
          "Un ricordo successivo attribuito a Feynman",
          "Un episodio con data certa al minuto",
        ],
        1,
        "Distinguere il tipo di fonte è parte della ricerca storica.",
      ),
    ],
  },
  {
    id: "trinity",
    chapter: 2,
    place: "radio",
    title: "Un messaggio prima dell’alba",
    date: "16 luglio 1945",
    kind: "Comunicazioni",
    duration: "2 min",
    intro:
      "Dalla sala comunicazioni ricostruisci una notizia arrivata dal sito di Trinity. Controlla luogo e data prima di aggiungerla al diario.",
    fact: "Il primo test nucleare avvenne il 16 luglio 1945 al poligono di Alamogordo, nel sud del New Mexico. Trinity non si trovava nel campus di Los Alamos.",
    adaptation:
      "Il messaggio radio è inventato. Questa scena racconta l’arrivo di una notizia: non mette in scena il test né le sue procedure.",
    source: trinity,
    steps: [
      step(
        "Quale luogo riporti nel messaggio?",
        "Il test si svolse lontano dal campus, nel sud del New Mexico.",
        [
          "Il cortile della biblioteca",
          "Il centro di Santa Fe",
          "Il sito Trinity al poligono di Alamogordo",
        ],
        2,
        "Il sito del test è distinto dal laboratorio di Los Alamos.",
      ),
      step(
        "Quale data aggiungi alla notizia?",
        "È la prima prova nucleare della storia, nel luglio 1945.",
        ["16 luglio 1945", "16 luglio 1943", "16 luglio 1946"],
        0,
        "La data del test è stata verificata.",
      ),
    ],
  },
  {
    id: "memory",
    chapter: 2,
    place: "library",
    title: "Le pagine che mancano",
    date: "1945 · sguardo retrospettivo",
    kind: "Memoria",
    duration: "2 min",
    intro:
      "Il diario è quasi completo. Prima di chiuderlo, cerca anche le storie delle persone che non lavoravano nei laboratori.",
    fact: "La creazione di Los Alamos costrinse gli abitanti di fattorie locali ad abbandonare le proprie case e portò alla chiusura della Ranch School. La storia del sito comprende anche queste perdite.",
    adaptation:
      "Questo momento conclusivo è una riflessione contemporanea, non una riunione storica del 1945. Non assegna ai protagonisti parole non documentate.",
    source: displacement,
    steps: [
      step(
        "Quale testimonianza aggiungi al diario?",
        "Una storia completa guarda anche oltre il gruppo scientifico.",
        [
          "Solo l’elenco degli strumenti",
          "Le esperienze degli abitanti allontanati",
          "Soltanto le fotografie del laboratorio",
        ],
        1,
        "Le persone coinvolte nella trasformazione del territorio fanno parte della storia.",
      ),
      step(
        "Quale nota contestualizza Trinity?",
        "Il National Park Service documenta anche le conseguenze della ricaduta radioattiva.",
        [
          "Non ebbe conseguenze fuori dal sito",
          "Contano soltanto i risultati scientifici",
          "Il test espose anche comunità vicine e sottovento a radiazioni",
        ],
        2,
        "Il diario include risultati e conseguenze umane.",
      ),
    ],
  },
];
// The final step draws on NPS Trinity as well as the episode source.
EVENTS.at(-1).additionalSources = [trinity];

// Small workbench interactions use invented sample data, not original research data.
Object.assign(EVENTS.find((e) => e.id === "calculators").steps[0], {
  interaction: "compare",
  prompt: "Confronta le due macchine. Quale riga segnala un problema?",
  hint: "Nella seconda riga le due macchine danno risultati diversi. 9 + 6 fa 15.",
  options: ["Riga 1", "Riga 2", "Riga 3"],
  answer: 1,
  rows: [
    ["8 + 7", "15", "15"],
    ["9 + 6", "15", "14"],
    ["6 + 6", "12", "12"],
  ],
  feedback:
    "La riga 2 segnala un risultato diverso: hai individuato la macchina da controllare.",
});
Object.assign(EVENTS.find((e) => e.id === "cards").steps[0], {
  interaction: "sequence",
  prompt: "Metti in ordine il piccolo flusso di lavoro.",
  hint: "Prima prepara il lotto, poi elaboralo, infine verifica il risultato.",
  options: ["Prepara il lotto", "Elabora le schede", "Verifica il risultato"],
  answer: [0, 1, 2],
  feedback:
    "Preparazione, elaborazione e verifica: il lotto ora ha un percorso chiaro.",
});
EVENTS.find((e) => e.id === "cards").adaptation =
  "Le tre fasi sono simboliche. Non riproducono una procedura originale IBM né i calcoli del progetto.";

Object.assign(EVENTS.find((e) => e.id === "cards").steps[1], {
  prompt: "Chi rendeva possibile il lavoro con queste macchine?",
  hint: "Le apparecchiature erano elettromeccaniche. Il flusso dipendeva dalle persone che lo organizzavano.",
  options: [
    "Un programma elettronico autonomo",
    "Soltanto i fisici teorici",
    "Operatori e operatrici organizzati in gruppi",
  ],
  answer: 2,
  feedback:
    "Dietro le schede c’erano persone: preparazione, organizzazione e controllo.",
});
