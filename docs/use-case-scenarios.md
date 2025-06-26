### 3.1.2 Diagramma UML dei Casi d'Uso Generali

Il diagramma UML dei casi d'uso generali è stato definito nel file `doc/diagrams/use-cases/general-use-cases.puml`. Questo diagramma sintetizza i principali casi d'uso del sistema, evidenziando le interazioni tra attori (Clienti, Operatori di Supporto, Amministratori, Sistema OpenAI) e le funzionalità del sistema.

Il diagramma mostra chiaramente le tre categorie principali di attori che interagiscono con il sistema e le loro operazioni caratteristiche:
- **Clienti**: Utilizzano il sistema per richiedere assistenza, consultare documentazione ed eseguire operazioni tecniche
- **Operatori di Supporto**: Gestiscono i ticket escalati dal sistema AI
- **Amministratori**: Supervisionano il sistema con accesso a funzionalità di monitoraggio e configurazione
- **Sistema OpenAI**: Fornisce le capacità di elaborazione del linguaggio naturale



### 3.1.4 Escalation Automatica verso Supporto Umano

Un caso d'uso fondamentale è la capacità del sistema di riconoscere quando una richiesta supera le proprie capacità e deve essere gestita da un operatore umano.

#### Scenario: Richiesta Complessa o Non Risolvibile Automaticamente

**Attori**: Cliente, Sistema ChatBot, Operatore Supporto

**Flusso Principale**:
1. Il cliente presenta un problema complesso o non standard
2. Il sistema tenta di comprendere e risolvere la richiesta
3. Il sistema riconosce che non possiede le conoscenze adeguate a rispondere alla domanda
4. Il sistema crea un ticket di supporto
5. Il sistema notifica il cliente che la sua richiesta è stata presa in carico e verrà gestita da un operatore umano
6. Il sistema notifica un operatore disponibile del nuovo ticket
7. L'operatore riceve tutte le informazioni necessarie, inclusa la cronologia della conversazione
8. L'operatore può rispondere al cliente attraverso l'interfaccia di gestione ticket

Il diagramma dettagliato di questo caso d'uso è disponibile nel file `doc/diagrams/use-cases/ticket-escalation-use-case.puml`.

### 3.1.5 Monitoraggio da Parte degli Amministratori

Un caso d'uso importante per la gestione efficace del sistema riguarda il monitoraggio delle conversazioni e delle performance da parte degli amministratori.

#### Scenario: Analisi delle Conversazioni e delle Performance

**Attori**: Amministratore, Sistema ChatBot

**Flusso Principale**:
1. L'amministratore accede alla dashboard amministrativa
2. Il sistema carica le metriche di utilizzo e le conversazioni recenti
3. L'amministratore visualizza le statistiche di utilizzo
4. L'amministratore può approfondire specifiche conversazioni per valutare la qualità delle risposte
5. L'amministratore può applicare filtri per analizzare categorie specifiche di richieste

Questo scenario è implementato attraverso diversi endpoint nel file `web-server.ts` che forniscono accesso ai dati necessari:
- `GET_ALL_USERS`: Recupera la lista completa degli utenti
- `ALL_USERS_DATA`: Fornisce dati dettagliati su tutti gli utenti
- `GET_MESSAGES_USER_GPT`: Recupera le conversazioni tra utenti e il sistema AI

Il diagramma dettagliato di questo caso d'uso è disponibile nel file `doc/diagrams/use-cases/admin-monitoring-use-case.puml`.

### 3.1.6 Risposta a Ticket da Parte degli Operatori

Questo caso d'uso si concentra sul processo di gestione dei ticket di supporto da parte degli operatori umani.

#### Scenario: Gestione Ticket di Supporto

**Attori**: Operatore Supporto, Cliente, Sistema ChatBot

**Flusso Principale**:
1. L'operatore riceve una notifica di nuovo ticket
2. L'operatore visualizza i dettagli del ticket, inclusa la cronologia della conversazione
3. L'operatore analizza il problema e formula una risposta
4. L'operatore invia la risposta tramite l'interfaccia di gestione ticket
5. Il sistema elabora la risposta e la invia al cliente attraverso il canale appropriato (es. Telegram)
6. Il sistema aggiorna lo stato del ticket
7. Il cliente riceve la risposta e può continuare la conversazione se necessario

Questa funzionalità è implementata nel sistema tramite l'endpoint `ADMIN_REPLY_TICKET` nel file `web-server.ts`, con il supporto della funzione `sendAdminReplyToUser` dal file `aux-functions.ts` per la notifica ai clienti.

## 3.2 Flow Dettagliati

### 3.2.1 Gestione Conversazione Standard

Il flusso di una conversazione standard tra un utente e il chatbot AI rappresenta il caso d'uso più frequente e costituisce il nucleo funzionale del sistema. Questo flusso è implementato principalmente nelle funzioni `storeMessageAndCreateReply` del file `aux-functions.ts` e `createReply` del file `openai-handlers.ts`.

Il diagramma di sequenza che illustra questo flusso è disponibile nel file `doc/diagrams/sequence/conversation-flow.puml`.

Il flusso completo include le seguenti fasi:
1. **Iniziazione della Conversazione** (gestita da `bot.ts`)
2. **Identificazione Utente** (funzione `getUserOrCreate` in `aux-functions.ts`)
3. **Creazione Messaggio Utente** (funzione `createUserMessage` in `aux-functions.ts`)
4. **Elaborazione AI** (funzione `createReply` in `openai-handlers.ts`)
5. **Esecuzione Funzioni** (se necessario, mediante `handleToolCalls` in `openai-handlers.ts`)
6. **Risposta al Cliente** (formattazione con `formatGPTResponse` in `aux-functions.ts`)
7. **Aggiornamento Statistiche** (notifica a Konsolex tramite endpoint in `constants.ts`)

### 3.2.2 Processo di Escalation

Il processo di escalation rappresenta un flusso critico che determina quando e come le richieste vengono inoltrate agli operatori umani. Questo flusso è implementato principalmente attraverso la funzione `sendMessageToAdmin` del file `endpoint.ts`.

Il diagramma di sequenza che illustra questo processo è disponibile nel file `doc/diagrams/sequence/escalation-flow.puml`.

Il processo include i seguenti passaggi principali:
1. **Trigger dell'Escalation** (può avvenire su richiesta esplicita, per rilevamento AI o per problemi tecnici)
2. **Creazione del Ticket** (funzioni in `message-repository.ts` e `ticketsCashe.ts`)
3. **Notifica agli Operatori** (tramite array `TelegramAdminIdArray` in `constants.ts`)
4. **Notifica all'Utente** (tramite Bot Telegram)
5. **Gestione Stato del Ticket** (aggiornamento stato con `updateTicketStatusByMsgId`)

### 3.2.3 Ciclo di Vita dei Ticket

Il ciclo di vita di un ticket all'interno del sistema segue un flusso ben definito che garantisce una gestione efficace delle problematiche dall'apertura fino alla risoluzione. Questo flusso è implementato attraverso diverse funzioni nei file `web-server.ts` ed `endpoint.ts`.

Il diagramma di sequenza che illustra questo ciclo di vita è disponibile nel file `doc/diagrams/sequence/ticket-lifecycle.puml`.

Le fasi principali includono:
1. **Creazione** (tramite `sendMessageToAdmin` e `getOrCreateTicket`)
2. **Assegnazione** (gestita dagli endpoint in `web-server.ts`)
3. **Elaborazione** (interfaccia con bottoni interattivi in Telegram)
4. **Interazione** (utilizzo di `MessageType` definito in `Message.ts`)
5. **Risoluzione** (endpoint `CLOSE_TICKET` in `web-server.ts`)
6. **Feedback** (possibilità di raccolta feedback dall'utente)
7. **Archiviazione** (mantenimento dei ticket chiusi per referenza futura)

### 3.2.4 Autenticazione e Autorizzazione

Il sistema implementa un modello di autenticazione e autorizzazione per garantire che solo gli utenti autorizzati possano accedere alle funzionalità appropriate. Questo è gestito principalmente attraverso il file `environment.ts` e vari controlli negli endpoint in `web-server.ts`.

Il diagramma di sequenza che illustra questo flusso è disponibile nel file `doc/diagrams/sequence/auth-flow.puml`.

Gli aspetti principali includono:
1. **Autenticazione Utente** (funzione `checkUserIdExists` in `endpoint.ts`)
2. **Integrazione con Konsolex** (utilizzo di token comuni)
3. **Autorizzazione Basata sui Ruoli** (controlli implementati negli endpoint)
4. **Sicurezza dei Dati** (gestione tramite `environment.ts`)

## 3.3 Conclusioni sui Casi d'Uso

L'analisi dettagliata dei casi d'uso ha messo in evidenza la complessità e la ricchezza funzionale del sistema di chatbot AI sviluppato. I flussi descritti evidenziano come il sistema sia stato progettato per:

1. **Bilanciare automazione e intervento umano**, riconoscendo i propri limiti e facilitando un'escalation fluida quando necessario

2. **Offrire assistenza tecnica concreta**, non limitandosi a fornire informazioni ma anche eseguendo direttamente operazioni tecniche quando appropriato

3. **Mantenere la continuità dell'esperienza utente** attraverso diversi canali e modalità di interazione

4. **Garantire la tracciabilità delle interazioni** per scopi di qualità e monitoraggio

5. **Ottimizzare il lavoro degli operatori** fornendo contesto completo e strumenti efficaci per la gestione dei ticket

Questi casi d'uso hanno guidato le scelte implementative descritte nei capitoli successivi, garantendo che il sistema rispondesse adeguatamente alle reali esigenze degli utenti e dell'organizzazione.