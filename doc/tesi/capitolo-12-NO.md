# Capitolo 12: Sicurezza e Affidabilità

La sicurezza e l'affidabilità rappresentano aspetti fondamentali del sistema chatbot AI, garantendo la protezione delle informazioni sensibili e un funzionamento continuo del servizio anche in presenza di condizioni avverse. Questo capitolo esplora le strategie implementate per assicurare un elevato livello di sicurezza e robustezza operativa, elementi essenziali in un contesto di supporto tecnico aziendale dove la confidenzialità dei dati e la disponibilità del servizio sono prioritari.

## 12.1 Autenticazione e Autorizzazione

Il sistema implementa un robusto framework di controllo degli accessi, differenziando tra utenti standard e amministratori con privilegi elevati, ed assicurando che ogni operazione sia eseguita solo da soggetti autorizzati.

### 12.1.1 Controllo degli Accessi API

Nel file `web-server.ts`, il sistema implementa un meccanismo di autenticazione basato su token per proteggere le API REST. Le richieste alle API amministrative richiedono un token di autenticazione valido, verificato attraverso appositi middleware:

```typescript
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

Il sistema distingue chiaramente tra endpoint pubblici, endpoint utente ed endpoint amministrativi attraverso costanti definite in `constants.ts`:

- `API`: Endpoint accessibili agli utenti autenticati
- `ADMIN_API`: Endpoint riservati agli amministratori

Questa separazione assicura che solo gli utenti con privilegi amministrativi possano accedere a funzionalità sensibili come la gestione dei ticket o la visualizzazione di informazioni sugli utenti.

### 12.1.2 Identificazione e Verifica degli Utenti

Il sistema implementa un processo di identificazione utente multi-canale:

1. **Identificazione Telegram**: Gli utenti che interagiscono tramite Telegram sono identificati attraverso il loro `telegram_id`, un identificativo univoco fornito dalla piattaforma Telegram.

2. **Verifica Konsolex**: La funzione `checkUserIdExists` in `endpoint.ts` verifica che l'utente sia registrato sulla piattaforma Konsolex prima di consentire operazioni che richiedono autorizzazioni specifiche.

3. **Persistenza dell'Identificazione**: La funzione `getUserOrCreate` in `aux-functions.ts` garantisce che gli utenti mantengano una sessione coerente tra diverse interazioni, recuperando informazioni utente persistenti o creandone di nuove quando necessario.

### 12.1.3 Segregazione dei Ruoli

Il sistema implementa una chiara segregazione dei ruoli tra:

1. **Utenti standard**: Possono interagire con il chatbot, aprire ticket e richiedere operazioni sui propri servizi.

2. **Amministratori**: Possono gestire ticket, visualizzare conversazioni di tutti gli utenti e eseguire operazioni amministrative.

Questa segregazione è implementata nei file di configurazione attraverso l'array `TelegramAdminIdArray` in `constants.ts`, che definisce gli ID Telegram degli amministratori autorizzati.

## 12.2 Validazione degli Input

La validazione degli input rappresenta la prima linea di difesa contro attacchi e malfunzionamenti, assicurando che i dati ricevuti rispettino i formati attesi prima di qualsiasi elaborazione.

### 12.2.1 Validazione delle Richieste API

Le funzioni di gestione delle richieste in `web-server.ts` implementano controlli di validazione sui parametri delle richieste, verificando la presenza di campi obbligatori e il loro formato:

```typescript
app.post(API.SEND_MESSAGE, async (req, res) => {
  const { text, userId, tg_id } = req.body as SendMessageRequest;
  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }
  if (!tg_id) {
    return res.status(400).json({ message: "telegram_id is required." });
  }
  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Message text is required and cannot be empty." });
  }
  // ...processamento della richiesta...
}
```

Questa validazione previene errori dovuti a dati incompleti o malformati, migliorando sia la sicurezza che la stabilità del sistema.

### 12.2.2 Sanitizzazione dei Parametri di Function Calling

Il meccanismo di function calling implementato in `openai-handlers.ts` include un robusto sistema di validazione per i parametri passati alle funzioni eseguibili:

- **Validazione dei tipi**: Assicura che i parametri corrispondano ai tipi attesi
- **Validazione semantica**: Verifica che i valori abbiano senso nel contesto dell'operazione
- **Controllo di autorizzazione**: Verifica che l'utente sia autorizzato a eseguire una determinata funzione

La funzione `executeTool` implementa questi controlli prima di richiamare qualsiasi operazione esterna:

```typescript
async function executeTool(functionName: string, args: any, userId: string, msgId: number): Promise<any> {
  switch (functionName) {
    case 'restartServer':
      return await restartServer(userId, args.serverName);
    // ...altri casi...
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}
```

### 12.2.3 Best Match per Input Utente

Il sistema implementa tecniche avanzate per la gestione di input utente potenzialmente imprecisi o ambigui. La funzione `findBestMatch` in `endpoint.ts` utilizza un algoritmo di fuzzy matching per identificare la corrispondenza più probabile quando un utente specifica il nome di un server o altro elemento:

```typescript
function findBestMatch(searchTerm: string, possibilities: string[]): string | null {
  let bestMatch = null;
  let bestScore = 0;
  // ...logica di matching...
  return bestScore > 0.5 ? bestMatch : null;
}
```

Questa capacità di tolleranza agli errori migliora l'usabilità mantenendo al contempo i controlli di sicurezza necessari.

## 12.3 Gestione degli Errori

Un sistema robusto di gestione degli errori è essenziale per garantire che il chatbot continui a funzionare correttamente anche in presenza di condizioni impreviste o fallimenti di componenti esterni.

### 12.3.1 Strategie di Gestione Errori API

Le funzioni in `web-server.ts` e `endpoint.ts` implementano un pattern consistente per la gestione degli errori:

1. **Cattura strutturata**: Tutte le operazioni potenzialmente problematiche sono racchiuse in blocchi try/catch
2. **Logging dettagliato**: Gli errori vengono registrati con informazioni contestuali per facilitare il debug
3. **Risposte appropriate**: Gli errori sono tradotti in risposte HTTP con codici appropriati e messaggi informativi

```typescript
try {
  // Operazione che potrebbe fallire
} catch (error) {
  console.error("Errore specifico:", error);
  return res.status(500).json({ error: "Messaggio di errore user-friendly" });
}
```

### 12.3.2 Gestione Errori nelle Interazioni con OpenAI

Il sistema implementa sofisticate strategie per gestire errori nelle interazioni con l'API OpenAI in `openai-handlers.ts`:

1. **Categorizzazione degli errori**: Errori categorizzati come "INVALID_RESPONSE", "TIMEOUT", ecc.
2. **Risposte degradate**: In caso di errore, il sistema fornisce risposte alternative che preservano la continuità della conversazione
3. **Reset dei thread**: In caso di errori persistenti, il sistema può creare un nuovo thread per ripristinare la funzionalità

```typescript
catch (error) {
  console.error("Error in createReply:", error);

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
  return "Si è verificato un errore imprevisto. Riprova più tardi.";
}
```

### 12.3.3 Gestione Errori nelle Integrazioni Esterne

La gestione degli errori per le integrazioni con la piattaforma Konsolex è particolarmente robusta. Le funzioni in `endpoint.ts` come `restartServer` o `getDomainList` implementano:

1. **Rilevamento specifico di errori HTTP**: Discrimination tra diversi codici di errore (401, 404, 500)
2. **Logging contestuale**: Registrazione di informazioni specifiche sull'operazione fallita
3. **Risultati predicibili**: Anche in caso di errore, le funzioni restituiscono sempre valori ben definiti (boolean, undefined) per facilitare la gestione da parte dei chiamanti

## 12.4 Logging e Monitoraggio

Il sistema implementa un framework di logging e monitoraggio che consente di tracciare il comportamento del sistema e identificare proattivamente problemi potenziali.

### 12.4.1 Strategia di Logging

Il sistema utilizza un approccio strutturato al logging attraverso:

1. **Logging API**: Il middleware in `web-server.ts` registra tutte le richieste in ingresso:

```typescript
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

2. **Logging operazioni critiche**: Funzioni come `openai-handlers.ts` implementano logging dettagliato per le interazioni con l'API OpenAI:

```typescript
console.log(`Run Status [Attempt ${attempts + 1}/${MAX_RETRIES}]:`, {
  status: run.status,
  threadId: threadId,
  runId: runId,
  timestamp: new Date().toISOString(),
  details: { /* ... */ }
});
```

3. **Logging errori**: Tutte le eccezioni catturate sono registrate con dettagli contestuali per facilitare il debugging.

### 12.4.2 Metriche di Performance

Il sistema raccoglie metriche di performance cruciali per monitorare la salute e l'efficacia del chatbot:

1. **Tempi di risposta**: Le operazioni di interazione con OpenAI sono monitorate per tempi di risposta
2. **Qualità delle risposte**: Il sistema registra score di relevance nella tabella `scores` per valutare la qualità delle risposte
3. **Utilizzo delle funzioni**: Il function calling traccia quali funzioni vengono utilizzate più frequentemente

La classe `Score` in `entities/Score.ts` memorizza queste metriche di qualità per analisi successive.

### 12.4.3 Alerting e Notifiche

Il sistema implementa un meccanismo di alerting per notificare gli amministratori di problemi critici:

1. **Notifiche Telegram**: Gli amministratori ricevono messaggi Telegram per ticket aperti e situazioni critiche
2. **Dashboard web**: Il web server fornisce endpoint per monitorare lo stato del sistema

Queste notifiche consentono un intervento tempestivo in caso di problemi, migliorando la disponibilità complessiva del sistema.

## 12.5 Strategie di Recovery da Fallimenti

Il sistema è progettato per essere resiliente a vari tipi di fallimenti, implementando strategie di recovery che consentono di ripristinare la normale operatività con un impatto minimo sull'utente.

### 12.5.1 Timeout e Retry

La funzione `waitForResponse` in `openai-handlers.ts` implementa un sofisticato meccanismo di timeout e retry:

```typescript
const MAX_RETRIES = 50;
const POLLING_INTERVAL = 2000;

while (attempts < MAX_RETRIES) {
  // ...tentativo di operazione...
  await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
  attempts++;
}
```

Questo approccio consente al sistema di gestire latenze temporanee nelle API esterne senza interrompere il flusso conversazionale.

### 12.5.2 Creazione di Nuovi Thread

In caso di problemi persistenti con un thread conversazionale, il sistema può creare un nuovo thread per ripristinare la funzionalità:

```typescript
const newThread = await openai.beta.threads.create();
await userOps.updateThreadByUserId(userId, newThread.id);
```

Questa strategia garantisce che problemi isolati con un thread specifico non compromettano l'esperienza complessiva dell'utente.

### 12.5.3 Fallback a Comportamenti Degradati

Il sistema implementa strategie di fallback per garantire il servizio anche in condizioni non ottimali:

1. **Risposte predefinite**: In caso di errori nell'API OpenAI, il sistema fornisce risposte predefinite informative
2. **Escalation automatica**: Problemi persistenti possono innescare automaticamente l'escalation a operatori umani
3. **Limitazioni funzionali**: In caso di problemi con specifiche funzionalità, il sistema può continuare a operare con funzionalità ridotte

Questo approccio a strati per la gestione dei fallimenti garantisce che il sistema mantenga una disponibilità elevata anche in presenza di problemi con componenti specifici.

## 12.6 Protezione dei Dati

Il sistema implementa diverse strategie per proteggere i dati sensibili degli utenti e garantire la confidenzialità delle conversazioni.

### 12.6.1 Minimizzazione dei Dati

Il sistema applica il principio di minimizzazione dei dati, raccogliendo e memorizzando solo le informazioni necessarie per il funzionamento del servizio:

1. **Dati utente limitati**: Solo identificatori e informazioni essenziali sono memorizzati
2. **Messaggi pertinenti**: Solo i messaggi rilevanti per il supporto tecnico sono conservati

Questo approccio riduce il rischio in caso di violazioni della sicurezza e semplifica la conformità con le normative sulla protezione dei dati.

### 12.6.2 Separazione dei Contesti

Il sistema mantiene una rigorosa separazione tra i contesti conversazionali di diversi utenti:

1. **Thread isolati**: Ogni utente ha un proprio thread OpenAI isolato
2. **Repository separati**: Le implementazioni dei repository assicurano che i dati di un utente non siano accessibili ad altri utenti

Questa separazione impedisce la contaminazione tra contesti conversazionali diversi e protegge la riservatezza delle comunicazioni.

### 12.6.3 Configurazione Sicura

Il file `environment.ts` implementa una gestione sicura delle configurazioni sensibili:

```typescript
function getEnvVariable(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is missing`);
    }
    return value;
}
```

Questo approccio garantisce che le credenziali e altre informazioni sensibili siano gestite in modo sicuro attraverso variabili d'ambiente, piuttosto che essere codificate direttamente nel codice.

## 12.7 Conclusioni sulla Sicurezza e Affidabilità

L'approccio alla sicurezza e all'affidabilità adottato nel sistema chatbot AI è caratterizzato da una strategia multi-livello che bilancia protezione e usabilità. I meccanismi di autenticazione e autorizzazione, la validazione rigorosa degli input, la gestione strutturata degli errori, il logging dettagliato e le strategie di recovery lavorano in sinergia per creare un sistema che è tanto sicuro quanto resiliente.

Particolare attenzione è stata dedicata alla gestione degli errori nelle integrazioni con sistemi esterni, riconoscendo che un chatbot di supporto tecnico deve continuare a funzionare anche quando alcuni componenti esterni sono temporaneamente non disponibili.

Le strategie implementate garantiscono non solo la protezione dei dati sensibili e la continuità del servizio, ma anche la capacità del sistema di evolvere mantenendo elevati standard di sicurezza e affidabilità.
