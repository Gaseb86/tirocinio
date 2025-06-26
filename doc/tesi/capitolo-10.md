# Capitolo 10: Funzionalità Implementate

Questo capitolo esplora in dettaglio le funzionalità operative implementate nel chatbot AI, con particolare enfasi sul meccanismo di function calling che consente all'assistente OpenAI di eseguire operazioni concrete sulla piattaforma Konsolex. Questa caratteristica rappresenta il ponte tra le capacità di comprensione del linguaggio naturale dell'AI e l'esecuzione di azioni tecniche specifiche, permettendo al sistema di offrire un supporto operativo completo oltre alla semplice assistenza informativa.

## 10.1 Architettura del Function Calling

Il function calling rappresenta uno degli aspetti più innovativi del sistema, consentendo all'AI di riconoscere quando è necessario eseguire operazioni tecniche specifiche e invocarle in modo trasparente all'interno del flusso conversazionale.

### 10.1.1 Principi di Funzionamento

Il meccanismo di function calling si basa sulla capacità dell'API OpenAI di analizzare il contesto della conversazione, determinare quando è necessaria l'esecuzione di una funzione specifica, e richiedere parametri appropriati.
L'architettura implementata nel file `openai-handlers.ts` segue un flusso ben definito:

1. L'utente esprime una richiesta che richiede un'azione tecnica
2. L'AI analizza la richiesta e determina quale funzione è necessaria
3. Il sistema raccoglie i parametri richiesti, chiedendo informazioni aggiuntive all'utente se necessario
4. La funzione viene eseguita tramite l'Endpoint Handler
5. Il risultato dell'operazione viene restituito all'AI che lo incorpora nella risposta all'utente

### 10.1.2 Gestione del Ciclo di Richiesta-Esecuzione

La gestione del ciclo di vita completo di una richiesta di funzione è implementata principalmente nella funzione `handleToolCalls` del file `openai-handlers.ts`, che si occupa di:

1. Ricevere le richieste di tool (function call) dall'API OpenAI
2. Estrarre il nome della funzione e i parametri dalla richiesta
3. Invocare la funzione appropriata tramite il dispatcher `executeTool`
4. Gestire eventuali errori durante l'esecuzione
5. Restituire i risultati all'API OpenAI per incorporarli nella risposta

Questa implementazione consente un'integrazione fluida delle operazioni tecniche all'interno del flusso conversazionale, mantenendo l'esperienza utente coerente e naturale.

### 10.1.3 Dichiarazione delle Funzioni

Le funzioni disponibili per l'AI sono definite come "tools" nel file `openai-tool.ts`, utilizzando un formato JSON standardizzato che specifica:

- Nome della funzione
- Descrizione del suo scopo
- Parametri richiesti con tipi e descrizioni
- Requisiti sui parametri (quali sono obbligatori)

Questo approccio dichiarativo permette all'AI di comprendere quali funzioni sono disponibili e quali parametri sono necessari per la loro esecuzione, facilitando la raccolta delle informazioni necessarie dall'utente.

## 10.2 Operazioni su Server

Una delle categorie principali di funzionalità implementate riguarda la gestione e il controllo dei server, permettendo agli utenti di eseguire operazioni di manutenzione e troubleshooting comuni senza necessità di accedere direttamente ai pannelli di controllo.

### 10.2.1 Restart Server

La funzione `restartServer` implementata in `endpoint.ts` consente il riavvio di un server specificato, essenziale per risolvere problemi di prestazioni o servizi bloccati. L'implementazione gestisce:

1. Risoluzione del nome server in ID interno utilizzando `getServerId`
2. Chiamata all'API Konsolex tramite `KONSOLEX_ENDPOINT.RESTART_SERVER`
3. Gestione di errori come credenziali non valide o server non trovato
4. Feedback all'utente sull'esito dell'operazione

Questa funzionalità è particolarmente utile come prima risposta a numerosi problemi tecnici, spesso risolvendo temporanei malfunzionamenti senza necessità di intervento specializzato.

### 10.2.2 Riavvio Servizi Specifici

Il sistema implementa funzioni specializzate per il riavvio di servizi specifici come MySQL o Postfix attraverso la funzione `restartMysqlOrPostfix`, che consente un approccio più granulare alla risoluzione dei problemi. Questa funzionalità:

1. Identifica il server target tramite `getServerId`
2. Specifica il servizio da riavviare (mysql o postfix)
3. Esegue la chiamata API con i parametri appropriati
4. Gestisce specifici codici di errore e condizioni di eccezione

La disponibilità di queste funzioni più granulari consente di affrontare problemi specifici senza impattare l'intera infrastruttura del server.

### 10.2.3 Monitoraggio e Diagnostica

Il sistema include funzionalità per ottenere informazioni diagnostiche sui server, come:

- `getServerList`: Restituisce l'elenco dei server disponibili con il relativo tipo
- Monitoraggio dello stato del server attraverso le chiamate alle API Konsolex

Queste funzionalità permettono di raccogliere rapidamente informazioni essenziali per il troubleshooting e la gestione proattiva dei problemi.

## 10.3 Gestione Domini e DNS

La gestione domini e configurazioni DNS rappresenta una categoria cruciale di funzionalità, consentendo agli utenti di verificare, configurare e risolvere problemi relativi ai loro domini senza necessità di conoscere in dettaglio la sintassi DNS.

### 10.3.1 Gestione Domini

Il sistema implementa diverse funzionalità per la gestione dei domini:

- `getDomainList`: Recupera l'elenco dei domini associati all'utente
- `checkDomainAvailability`: Verifica la disponibilità di un dominio per registrazione
- `updateAuthinfo`: Aggiorna le informazioni di autenticazione per un dominio, facilitando operazioni come il trasferimento

Queste funzioni consentono agli utenti di eseguire operazioni comuni sui domini direttamente attraverso l'interfaccia conversazionale del chatbot.

### 10.3.2 Configurazione DNS

La gestione dei record DNS è implementata attraverso funzioni specializzate:

- `modifyDns`: Modifica un record DNS esistente
- `addDns`: Aggiunge un nuovo record DNS

Queste funzioni accettano parametri dettagliati come tipo di record, nome, valore, TTL e priorità, offrendo un'interfaccia semplificata per operazioni che tradizionalmente richiedono conoscenze tecniche specifiche.

### 10.3.3 Gestione rDNS

Il sistema supporta anche la configurazione di reverse DNS attraverso la funzione `modifyRdns`, che consente di associare nomi di dominio a indirizzi IP. Questa funzionalità è particolarmente importante per la configurazione corretta dei server email, migliorando la consegna delle email e riducendo il rischio di classificazione come spam.

## 10.4 Supporto per Container

Le funzionalità per la gestione dei container rappresentano un'area importante del sistema, consentendo agli utenti di gestire applicazioni containerizzate senza necessità di conoscere in dettaglio i comandi Docker o la configurazione specifica dei container.

### 10.4.1 Gestione del Ciclo di Vita dei Container

Il sistema implementa funzioni per gestire il ciclo di vita dei container:

- `restartWebContainer`: Riavvia un container web specifico
- `restartDbContainer`: Riavvia un container database associato a un sito

Queste funzioni astraggono la complessità della gestione dei container, permettendo agli utenti di risolvere problemi comuni come crash dell'applicazione o problemi di database con semplici richieste in linguaggio naturale.

### 10.4.2 Ottimizzazione Risorse Container

Una caratteristica distintiva del sistema è la possibilità di ottimizzare le risorse assegnate ai container attraverso funzioni come:

- `siteWebRamCpuMemoryImprove`: Modifica l'allocazione di CPU e memoria per un container web
- `siteDbRamCpuMemoryImprove`: Modifica l'allocazione di CPU e memoria per un container database

Queste funzionalità consentono di risolvere problemi di prestazioni senza necessità di accedere ai pannelli di configurazione avanzati, semplicemente chiedendo all'AI di aumentare le risorse disponibili per un sito o database specifico.

### 10.4.3 Diagnostica Container

Il sistema include funzionalità per ottenere informazioni diagnostiche sui container:

- `getSiteList`: Recupera l'elenco dei siti e il loro tipo (container o webserver)

Questa funzione permette di ottenere rapidamente una panoramica dei siti disponibili, facilitando operazioni successive come restart o ottimizzazione risorse.

## 10.5 Supporto per Configurazione Email

Le funzionalità relative alla configurazione email consentono agli utenti di gestire e risolvere problemi comuni relativi ai servizi di posta elettronica.

### 10.5.1 Riavvio Servizi Email

Il sistema implementa funzioni specializzate per il riavvio dei servizi email:

- `restartPostfix`: Riavvia il servizio Postfix su un server specifico

Questa funzionalità è particolarmente utile per risolvere problemi temporanei di invio o ricezione email senza necessità di interventi più invasivi.

### 10.5.2 Configurazione DNS Email

Le funzioni per la gestione dei record DNS includono supporto specifico per i record necessari alla configurazione email:

- Configurazione record MX per la ricezione delle email
- Configurazione record SPF, DKIM e DMARC per l'autenticazione delle email

Queste funzionalità permettono di configurare correttamente i servizi email riducendo il rischio di problemi di consegna o classificazione come spam.

## 10.6 Gestione Certificati SSL

La gestione dei certificati SSL rappresenta un'area importante per garantire la sicurezza e l'affidabilità dei siti web gestiti dagli utenti.

### 10.6.1 Diagnostica Certificati

Il sistema include funzionalità per diagnosticare problemi relativi ai certificati SSL, verificando la corretta configurazione e propagazione dei certificati per siti web e servizi email.

### 10.6.2 Riavvio dopo Modifiche SSL

Le funzioni di riavvio dei container e dei servizi sono particolarmente utili dopo modifiche ai certificati SSL, consentendo l'applicazione delle nuove configurazioni senza necessità di interventi manuali complessi.

## 10.7 Sistema di Escalation

Il sistema implementa una funzionalità cruciale di escalation verso operatori umani quando la complessità della richiesta supera le capacità automatizzate del chatbot.

### 10.7.1 Creazione Ticket

La funzione `openTicket` consente all'AI di creare un ticket per il supporto tecnico quando riconosce che un problema richiede intervento umano. Questa funzionalità:

1. Raccoglie il messaggio dettagliato del problema
2. Crea un ticket nel sistema di ticketing
3. Notifica gli amministratori della nuova richiesta
4. Fornisce all'utente conferma dell'apertura del ticket

Il sistema è progettato per aprire ticket solo con risposta affermativa dell'utente, garantendo che l'escalation avvenga solo quando effettivamente necessaria e desiderata.

## 10.8 Implementazione Tecnica delle Function Calls

L'implementazione tecnica del sistema di function calling rappresenta uno degli aspetti più sofisticati dell'architettura, integrando le capacità di OpenAI con le API di Konsolex.

### 10.8.1 Definizione delle Funzioni

Le funzioni sono definite in formato standardizzato JSON nel file `openai-tool.ts`, secondo la struttura richiesta dall'API OpenAI:

```json
// Esempio semplificato di definizione di una funzione
{
  "type": "function",
  "function": {
    "name": "restartServer",
    "description": "Riavvia un server specificato",
    "strict": true,
    "parameters": {
      "type": "object",
      "properties": {
        "serverName": {
          "type": "string",
          "description": "Nome del server da riavviare"
        }
      },
      "required": ["serverName"],
      "additionalProperties": false
    }
  }
}
```

Questa struttura dichiarativa permette all'API OpenAI di comprendere:
- Quale funzione può risolvere un determinato problema
- Quali parametri sono necessari per l'esecuzione
- Come guidare l'utente nella fornitura dei parametri mancanti

### 10.8.2 Gestione dell'Esecuzione

Il cuore dell'implementazione è rappresentato dalla funzione `executeTool` nel file `openai-handlers.ts`, che funge da dispatcher per le varie funzioni disponibili:

```javascript
// Implementazione semplificata del dispatcher
async function executeTool(functionName: string, args: any, userId: string, msgId: number): Promise<any> {
  switch (functionName) {
    case 'restartServer':
      return await restartServer(userId, args.serverName);
    case 'restartMysql':
      return await restartMysqlOrPostfix(userId, args.serverName, "mysql");
    case 'getDomainList':
      return await getDomainList(userId);
    // Altri casi...
    default:
      throw new Error(`Function ${functionName} not implemented`);
  }
}
```

Questa implementazione centralizzata facilita:
- L'aggiunta di nuove funzioni
- La gestione uniforme degli errori
- Il monitoring delle chiamate di funzione
- L'implementazione di controlli di sicurezza centralizzati

### 10.8.3 Integrazione con il Flusso Conversazionale

L'integrazione delle function calls nel flusso conversazionale avviene attraverso la funzione `handleToolCalls`, che viene invocata quando l'API OpenAI richiede l'esecuzione di una funzione:

```javascript
// Implementazione semplificata del gestore di tool calls
async function handleToolCalls(openai: OpenAI, run: any, threadId: string, runId: string, userId: string, msg: Message) {
  if (run.required_action?.type === 'submit_tool_outputs') {
    const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
    const toolOutputs = [];

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      try {
        const functionResult = await executeTool(functionName, functionArgs, userId, msg.id!);
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: typeof functionResult === 'string' ? functionResult : JSON.stringify(functionResult)
        });
      } catch (error) {
        // Gestione errori...
      }
    }

    // Sottomissione dei risultati all'API OpenAI
    if (toolOutputs.length > 0) {
      await openai.beta.threads.runs.submitToolOutputs(threadId, runId, { tool_outputs: toolOutputs });
    }
  }
}
```

Questa implementazione garantisce che:
1. Le richieste di function calling vengano correttamente interpretate
2. I risultati delle funzioni vengano restituiti all'API OpenAI
3. Gli errori vengano gestiti in modo appropriato
4. Il flusso conversazionale rimanga coerente anche in caso di operazioni tecniche complesse

## 10.9 Estensibilità del Sistema di Funzioni

Una caratteristica fondamentale del sistema è la sua estensibilità, progettata per facilitare l'aggiunta di nuove funzionalità operative senza modifiche significative all'architettura core.

### 10.9.1 Aggiunta di Nuove Funzioni

Il processo di aggiunta di nuove funzioni è stato standardizzato per garantire semplicità e coerenza:

1. Definizione della funzione in formato JSON secondo lo schema OpenAI
2. Implementazione della funzione effettiva nell'Endpoint Handler
3. Aggiunta del caso corrispondente nel dispatcher `executeTool`
4. Aggiornamento della documentazione interna

Il file `functionToAdd.txt` contiene esempi di definizioni di funzioni pronte per l'integrazione, come:

```json
{
  "type": "function",
  "function": {
    "name": "siteWebRamCpuMemoryImprove",
    "description": "Modifica le risorse CPU e memoria di un sito",
    "strict": true,
    "parameters": {
      "type": "object",
      "properties": {
        "siteName": {
          "type": "string",
          "description": "Nome del sito su cui modificare le risorse"
        },
        "cpu": {
          "type": "string",
          "description": "Valore CPU da assegnare, il valore deve essere tipo '0.1'"
        },
        "memory": {
          "type": "string",
          "description": "Valore memoria da assegnare, il valore deve essere tipo '100m'"
        }
      },
      "required": [
        "siteName",
        "cpu",
        "memory"
      ],
      "additionalProperties": false
    }
  }
}
```

### 10.9.2 Versioning delle Funzioni

Il sistema implementa un approccio di versioning implicito delle funzioni, permettendo:

1. L'evoluzione delle interfacce di funzione nel tempo
2. Il mantenimento della compatibilità con conversazioni esistenti
3. L'introduzione di nuovi parametri o comportamenti in modo non distruttivo

Questo approccio garantisce che il sistema possa evolvere continuamente senza compromettere l'esperienza utente o la coerenza delle conversazioni in corso.

## 10.10 Sicurezza e Validazione nelle Function Calls

La sicurezza rappresenta un aspetto fondamentale nell'implementazione delle function calls, considerando che queste funzioni eseguono operazioni potenzialmente critiche sui sistemi degli utenti.

### 10.10.1 Validazione dei Parametri

Il sistema implementa rigorosi controlli di validazione sui parametri ricevuti:

1. Validazione di tipo tramite la definizione JSON Schema
2. Controlli aggiuntivi sui valori ammissibili
3. Sanitizzazione degli input per prevenire iniezioni o altri attacchi
4. Risoluzione dei valori ambigui attraverso matching intelligente (come nella funzione `findBestMatch`)

### 10.10.2 Autorizzazione delle Operazioni

Ogni richiesta di funzione viene autenticata e autorizzata prima dell'esecuzione:

1. Verifica dell'identità dell'utente tramite l'ID utente
2. Controllo delle autorizzazioni rispetto alla risorsa target
3. Limitazione delle operazioni alle risorse di proprietà dell'utente
4. Logging delle operazioni per audit e tracciabilità

### 10.10.3 Gestione degli Errori

La gestione degli errori nelle function calls è progettata per essere robusta e informativa:

1. Cattura e classificazione degli errori in categorie comprensibili
2. Messaggi di errore user-friendly che guidano verso la risoluzione
3. Fallback intelligenti in caso di problemi temporanei
4. Notifica agli amministratori per errori critici o ricorrenti

## 10.11 Metriche e Performance

Il sistema raccoglie e analizza metriche relative all'utilizzo e alle performance delle function calls, fornendo insight preziosi per l'ottimizzazione continua.

### 10.11.1 Metriche di Utilizzo

Le principali metriche monitorate includono:

1. Frequenza di utilizzo per ciascuna funzione
2. Tasso di successo/fallimento delle chiamate
3. Distribuzione delle chiamate per tipo di utente e contesto
4. Pattern temporali di utilizzo

### 10.11.2 Performance e Ottimizzazione

Il sistema è costantemente ottimizzato sulla base dell'analisi delle performance:

1. Ottimizzazione dei tempi di risposta per le funzioni più critiche
2. Implementazione di caching dove appropriato
3. Batch processing per operazioni multiple correlate
4. Bilanciamento del carico per operazioni intensive

## 10.12 Conclusioni

L'implementazione delle funzionalità operative attraverso il meccanismo di function calling rappresenta uno degli aspetti più innovativi e potenti del sistema chatbot AI. Questa architettura consente di combinare la flessibilità dell'interazione in linguaggio naturale con la potenza delle operazioni tecniche concrete, offrendo agli utenti un'esperienza di supporto tecnico che va ben oltre le semplici risposte informative.

La modularità e l'estensibilità del sistema garantiscono che nuove funzionalità possano essere aggiunte con facilità, permettendo al chatbot di evolvere continuamente e rispondere a nuove esigenze operative. L'integrazione profonda con la piattaforma Konsolex crea un ecosistema coerente in cui gli utenti possono risolvere problemi e gestire le loro risorse senza bisogno di passare tra diverse interfacce o comprendere i dettagli tecnici sottostanti.

In definitiva, il sistema di funzionalità implementate rappresenta un ponte tra la semplicità dell'interazione conversazionale e la complessità delle operazioni tecniche, democratizzando l'accesso alle funzionalità avanzate di gestione server, domini e altri servizi cloud.