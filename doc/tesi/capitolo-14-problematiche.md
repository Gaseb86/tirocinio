# Capitolo 14: Problematiche Affrontate

Questo capitolo esamina le principali difficoltà incontrate durante lo sviluppo del progetto, le soluzioni adottate e le lezioni apprese. Ogni progetto di innovazione tecnologica comporta sfide uniche, e il sistema di chatbot AI per il supporto tecnico Konsolex non fa eccezione. Le problematiche affrontate spaziano da questioni tecniche specifiche a sfide più ampie di progettazione e integrazione.

## 14.1 Difficoltà di Integrazione con OpenAI

L'integrazione con l'API OpenAI ha rappresentato una delle sfide più significative del progetto, in particolare a causa dell'evoluzione continua della piattaforma durante il periodo di sviluppo.

### 14.1.1 Documentazione in Evoluzione e API in Beta

La documentazione di OpenAI, sebbene estesa, si è rivelata spesso insufficiente o non aggiornata rispetto alle funzionalità più recenti. Durante lo sviluppo del progetto, OpenAI ha introdotto nuove funzionalità in versione beta che, pur essendo potenzialmente utili, hanno richiesto un significativo lavoro di esplorazione e sperimentazione.

L'introduzione degli "Assistants" e dei "Threads" come parte dell'API beta ha rappresentato un punto di svolta per il progetto, portando potenziali miglioramenti ma anche richiedendo una sostanziale revisione dell'architettura iniziale. Il codice in `openai-handlers.ts` mostra chiaramente questo passaggio:

```typescript
// Implementazione con la nuova API beta di OpenAI
run = await openai.beta.threads.runs.create(
  user.thread_id,
  {
    assistant_id: user.assistant_id,
    tools: openaiTools,
    temperature: 0.1,
    top_p: 1,
    max_prompt_tokens: 10000,
    tool_choice: "auto"
  }
);
```

Questa transizione ha richiesto una comprensione approfondita di concetti come i thread di conversazione e gli assistenti, che erano stati introdotti solo recentemente nella documentazione ufficiale.

### 14.1.2 Gestione degli Stati delle Richieste

Un'altra sfida significativa è stata la gestione dello stato delle richieste all'API OpenAI, in particolare con il meccanismo asincrono delle run e dei tool calls. La funzione `waitForResponse` in `openai-handlers.ts` illustra la complessità di questo processo:

```typescript
while (attempts < MAX_RETRIES) {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);
  
  console.log(`Run Status [Attempt ${attempts + 1}/${MAX_RETRIES}]:`, {
    status: run.status,
    threadId: threadId,
    runId: runId,
    timestamp: new Date().toISOString(),
    // ...dettagli aggiuntivi...
  });

  if (run.status === 'completed') {
    // Gestione completamento
  } else if (run.status === 'failed' || run.status === 'expired') {
    // Gestione errori
  } else if (run.status === 'requires_action') {
    // Gestione azioni richieste (function calling)
  }
  // ...altro codice di gestione...
}
```

Questo polling sullo stato delle richieste ha richiesto una gestione attenta dei timeout, degli errori e delle condizioni di race che potevano verificarsi durante l'interazione con l'API.

## 14.2 Evoluzione del Prompt e Knowledge Base

La configurazione e ottimizzazione del prompt per l'assistente AI si è rivelata un processo iterativo e complesso, richiedendo numerosi aggiustamenti basati sui risultati osservati.

### 14.2.1 Ottimizzazione Progressiva del Prompt

Il prompt fornito all'assistente ha subito numerose revisioni durante lo sviluppo del progetto. Inizialmente concepito come un semplice insieme di istruzioni, si è evoluto in un sistema sofisticato che include:

- Definizione dell'identità e del tono dell'assistente
- Regole specifiche per la gestione di diverse categorie di richieste
- Linee guida per l'escalation verso operatori umani
- Istruzioni per l'utilizzo delle function calls
- Strategie per la gestione degli errori

Il file `prompt_2025_02_24.txt` mostra la complessità raggiunta:

```plaintext
[IDENTITÀ]
Nome: Paolo
Ruolo: Tecnico On The Cloud SRL - Non sono un bot o un robot
Età: 33 anni
Località: Genova
Hobby: Nuoto

[COMPORTAMENTO BASE]
A. Usa solo italiano nelle risposte.
B. Limite massimo di risposta: 300 token.
// ...altri dettagli comportamentali...

[REGOLE DI SELEZIONE FILE E RISPOSTA]
   - Se il problema riguarda:
      - Server
      - Sito web
      // ...altri tipi di problemi...
   La soluzione si trova in:
      - WEBSERVER.txt se il server è di tipo WEBSERVER
      - CONTAINER_WEBSITE.txt se il server è di tipo CONTAINER
   // ...altre mappature problema-soluzione...
```

La definizione di questo prompt ha richiesto settimane di test e aggiustamenti per raggiungere un equilibrio tra chiarezza nelle istruzioni e flessibilità nell'interazione.

### 14.2.2 Trasformazione del Vector Store

Un'altra sfida significativa è stata la trasformazione del formato dei file utilizzati per il vector store. Inizialmente, le informazioni tecniche erano strutturate in file JSON, ma questo formato si è rivelato limitante per rappresentare la ricchezza della conoscenza tecnica necessaria.

Il passaggio a documenti PDF ha permesso una rappresentazione più naturale della conoscenza, ma ha introdotto nuove complessità nella gestione dell'embedding e nel recupero delle informazioni pertinenti. I file nella directory `vectorStore` mostrano la struttura finale adottata, con documenti come `WEBSERVER.txt`, `WINDOWS.txt` e `CONTAINER_WEBSITE.txt` organizzati per domini specifici di conoscenza.

Questa evoluzione ha richiesto:

1. La conversione delle informazioni esistenti in un nuovo formato
2. La reimplementazione del sistema di embedding
3. L'ottimizzazione delle query per il nuovo vector store
4. Test estensivi per verificare la qualità delle risposte con il nuovo sistema

## 14.3 Sfide Tecniche di Implementazione

Lo sviluppo del sistema ha comportato numerose sfide tecniche, alcune delle quali legate alla scelta delle tecnologie, altre alle specificità del dominio di applicazione.

### 14.3.1 Apprendimento delle Tecnologie

Il progetto ha richiesto la padronanza di diverse tecnologie relativamente nuove:

- **TypeScript**: La curva di apprendimento iniziale per TypeScript è stata ripida, specialmente per quanto riguarda il sistema di tipi e le pratiche di programmazione funzionale.
- **API OpenAI**: L'utilizzo avanzato delle API di OpenAI ha richiesto una comprensione approfondita delle nuove funzionalità come gli assistenti, i thread e le chiamate di funzioni.
- **Express.js**: L'implementazione di un server web robusto con gestione appropriata delle route e dei middleware ha posto sfide iniziali.
- **Gestione delle Promesse**: Il codice asincrono pervasivo ha richiesto una solida comprensione delle promesse, async/await e gestione degli errori.

Il file `web-server.ts` mostra la complessità delle integrazioni necessarie:

```typescript
app.post(API.SEND_MESSAGE, async (req, res) => {
  // ...gestione validazione input...
  try {
    // Get or create user in a single operation
    const user = await aux.getUserOrCreate(openai, tg_id, userId);
    // Find open ticket
    const openTicket = findTicket(user.user_id);
    // ...logica condizionale complessa...
    // Update user message status
    axios.post(KONSOLEX_ENDPOINT.MESSAGES_UPDATE, { /* ... */ });
    // Create GPT reply
    gptReply = await aux.storeMessageAndCreateReply(openai, user, msg);
    // ...preparazione risposta...
  } catch (error) {
    console.error("Error in /api/sendMessage:", error);
    // ...gestione errore...
  }
});
```

### 14.3.2 Gestione dello Stato e Persistenza

La gestione dello stato della conversazione ha posto sfide significative, in particolare per mantenere la coerenza tra:

1. Lo stato del thread OpenAI
2. Lo stato persistente nel database
3. Lo stato dell'interfaccia utente
4. Lo stato dei ticket per il supporto umano

Il sistema ha richiesto un'attenta progettazione per garantire che questi diversi livelli di stato rimanessero sincronizzati, come evidenziato dalla complessità della funzione `getUserOrCreate` in `aux-functions.ts`:

```typescript
export async function getUserOrCreate(openai: OpenAI, tg_id: string, userId: string): Promise<User> {
  let user = await userOps.findByTelegramId(tg_id);
  if (user) {
    // ...aggiornamento username se mancante...
    user = await openaiOps.updateUserThreadAndAssistant(openai, user)
    return user;
  }
  const thread = await openai.beta.threads.create();

  // Use end point to get user name
  // ...recupero informazioni utente...

  return await userOps.create(
    userId,
    thread.id,
    OPENAI_ASSISTANT_ID_PAOLO,
    tg_id,
    userName
  );
}
```

### 14.3.3 Implementazione del Function Calling

L'implementazione delle function calls, sebbene potente, ha comportato significative complessità tecniche:

1. **Definizione delle Funzioni**: La definizione delle funzioni nel formato richiesto da OpenAI, con parametri e descrizioni appropriate
2. **Gestione dell'Esecuzione**: La creazione di un dispatcher efficiente per le diverse funzioni
3. **Validazione dei Parametri**: L'implementazione di controlli di validazione robusti per i parametri ricevuti
4. **Gestione degli Errori**: La creazione di un sistema resiliente per gestire fallimenti nelle chiamate di funzione

Il file `openai-handlers.ts` mostra la complessità di questo sistema:

```typescript
async function executeTool(functionName: string, args: any, userId: string, msgId: number): Promise<any> {
  switch (functionName) {
    case 'getDomainList':
      return await getDomainList(userId);
    case 'getServerList':
      return await getServerList(userId);
    // ...molti altri casi...
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}
```

## 14.4 Problematiche di Integrazione con Sistemi Esterni

L'integrazione con i sistemi esterni, in particolare con la piattaforma Konsolex, ha posto sfide significative che hanno richiesto soluzioni creative.

### 14.4.1 Comunicazione con l'API Konsolex

L'integrazione con l'API Konsolex ha richiesto la gestione di diverse problematiche:

1. **Autenticazione**: L'implementazione di un sistema robusto per la gestione dei token di autenticazione
2. **Coerenza dei Dati**: La gestione delle discrepanze tra il modello dati interno e quello dell'API esterna
3. **Gestione degli Errori**: La creazione di strategie per gestire errori, timeout e altre condizioni anomale

Il file `endpoint.ts` mostra la complessità di queste integrazioni:

```typescript
export async function getServerId(userId: string, serverName: string): Promise<ServerIdIp | undefined> {
  try {
    // ...tentativo di matching nome server...
    const response = await axios.post(
      KONSOLEX_ENDPOINT.GET_SERVER_ID,
      { server_name: serverName },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'userid': userId,
        },
      }
    );
    const serverData: ServerIdIp = response.data;
    return serverData;
  } catch (error) {
    console.error("Error getting server id:", error);
    return undefined;
  }
}
```

### 14.4.2 Sincronizzazione Multi-canale

Un'altra sfida significativa è stata la sincronizzazione tra i diversi canali di comunicazione, in particolare tra:

1. L'interfaccia Telegram
2. L'interfaccia web
3. Le notifiche nella piattaforma Konsolex

La sincronizzazione in tempo reale ha richiesto l'implementazione di meccanismi di notifica bidirezionali, come evidenziato dalla chiamata all'endpoint `MESSAGES_UPDATE` in diversi punti del codice:

```typescript
axios.post(
  KONSOLEX_ENDPOINT.MESSAGES_UPDATE,
  {
    updated: true,
    userid: user.user_id
  }
);
```

## 14.5 Lezioni Apprese e Approcci Risolutivi

Il superamento delle sfide descritte ha portato all'identificazione di approcci efficaci e best practice che hanno guidato lo sviluppo nelle fasi successive.

### 14.5.1 Sviluppo Incrementale e Prototipazione

L'approccio che si è rivelato più efficace è stato lo sviluppo incrementale, con cicli rapidi di:

1. Implementazione di una funzionalità minima
2. Test e valutazione
3. Raccolta di feedback
4. Miglioramento iterativo

Questo approccio è stato particolarmente utile per ottimizzare il prompt dell'assistente e il sistema di function calling, dove la qualità dell'interazione poteva essere valutata solo attraverso test reali.

### 14.5.2 Logging Dettagliato e Monitoraggio

L'implementazione di un sistema di logging dettagliato si è rivelata fondamentale per il debugging e l'ottimizzazione. Il codice in `openai-handlers.ts` mostra questo approccio:

```typescript
console.log(`Run Status [Attempt ${attempts + 1}/${MAX_RETRIES}]:`, {
  status: run.status,
  threadId: threadId,
  runId: runId,
  timestamp: new Date().toISOString(),
  details: {
    started_at: run.started_at,
    completed_at: run.completed_at,
    last_error: run.last_error,
    model: run.model,
    usage: run.usage
  }
});
```

Questo livello di dettaglio nel logging ha permesso di identificare e risolvere rapidamente problemi complessi nell'interazione con l'API OpenAI.

### 14.5.3 Gestione Robusta degli Errori

La gestione degli errori si è evoluta da semplici catch generici a un sistema sofisticato che:

1. Classifica gli errori per tipologia
2. Implementa strategie specifiche di recovery per ciascuna tipologia
3. Fornisce feedback appropriato all'utente
4. Registra informazioni dettagliate per il debugging

```typescript
if (error instanceof Error) {
  switch (error.message) {
    case "INVALID_RESPONSE":
      return "Mi dispiace, la risposta non è valida, puoi riprovare.";
    case "TIMEOUT":
      return "Mi dispiace, ci ho messo troppo tempo a rispondere. Ho resettato la conversazione, ora puoi riprovare.";
    default:
      return "Si è verificato un errore imprevisto, puoi riprovare.";
  }
}
```

### 14.5.4 Modularizzazione e Separazione delle Responsabilità

Con l'evoluzione del progetto, l'architettura è stata progressivamente modularizzata, con una chiara separazione delle responsabilità:

1. Il file `openai-handlers.ts` gestisce l'integrazione con OpenAI
2. Il file `endpoint.ts` gestisce l'integrazione con Konsolex
3. Il file `web-server.ts` gestisce la logica dell'API REST
4. Il file `aux-functions.ts` fornisce funzionalità di supporto comuni

Questa separazione ha facilitato il debugging, il testing e l'estensione del sistema.

## 14.6 Conclusioni sulle Problematiche Affrontate

Le sfide incontrate durante lo sviluppo del sistema chatbot AI per il supporto tecnico Konsolex hanno richiesto un approccio flessibile e resiliente, caratterizzato da adattamento continuo e apprendimento iterativo. Queste difficoltà, lungi dall'essere ostacoli insormontabili, si sono rivelate opportunità di crescita e miglioramento per il progetto.

L'esperienza ha confermato che l'integrazione di tecnologie emergenti come l'AI conversazionale richiede non solo competenze tecniche, ma anche:

1. **Flessibilità metodologica**: La capacità di adattare l'approccio di sviluppo in risposta a nuove informazioni e sfide impreviste.
2. **Apprendimento continuo**: La volontà di esplorare nuove API e paradigmi man mano che emergono.
3. **Progettazione resiliente**: Lo sviluppo di sistemi che possono adattarsi ai cambiamenti nelle tecnologie sottostanti.
4. **Attenzione al feedback**: L'integrazione continua del feedback degli utenti nel processo di sviluppo.

Le lezioni apprese durante il superamento di queste sfide hanno creato una solida base di conoscenza che guiderà gli sviluppi futuri, rendendo il sistema più robusto, efficace e adattabile alle esigenze in evoluzione degli utenti e dell'organizzazione.
