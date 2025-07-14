# Capitolo 11: Sistema di Ticketing

Il sistema di ticketing costituisce un elemento necessario nell'architettura del chatbot, operando come meccanismo di transizione intelligente tra la risposta automatizzata dell'AI e l'intervento specialistico degli operatori umani. Questo capitolo esplora in profondità l'implementazione del sistema, illustrando come realizzi la continuità dell'assistenza quando le richieste superano le capacità dell'automazione, garantendo che ogni problema trovi la giusta modalità di risoluzione.

## 11.1 Rilevamento Automatico di Problemi Complessi

Il sistema incorpora sofisticati meccanismi per identificare situazioni che richiedono l'intervento umano, implementando diverse strategie di rilevamento che operano sia a livello di comprensione del linguaggio che di analisi del contesto operativo.

### 11.1.1 Analisi Semantica delle Richieste

L'assistente AI è stato addestrato per riconoscere pattern linguistici che indicano problematiche complesse o richieste che esulano dalle sue capacità operative. In `openai-tool.ts` è definita la funzione `openTicket`, che viene invocata quando l'AI rileva autonomamente la necessità di escalation.

Questa capacità permette all'assistente di determinare quando una richiesta:
- Contiene problematiche multi-livello difficili da risolvere automaticamente
- Richiede interventi personalizzati non standardizzabili
- Riguarda casi di eccezione non coperti dalle procedure automatizzate

### 11.1.2 Rilevamento di Errori Operativi

Il sistema monitora attivamente gli esiti delle operazioni tecniche eseguite tramite function calling. In `openai-handlers.ts`, la funzione `executeTool` incorpora gestione degli errori che può portare all'escalation automatica quando:

1. Una funzione tecnica fallisce ripetutamente
2. Vengono rilevati errori inattesi durante l'esecuzione di un'operazione
3. Le risposte dalle API Konsolex indicano problematiche che richiedono intervento specialistico

### 11.1.3 Escalation Esplicita Utente

Oltre al rilevamento automatico, il sistema supporta l'escalation esplicita richiesta dall'utente. L'assistente è addestrato a riconoscere richieste dirette di supporto umano e a verificarne l'intenzionalità prima di procedere, come evidenziato dalle istruzioni nella definizione di `openTicket`: GitHub Copilot
capitolo-11.md+13-1
"name": "openTicket", "description": "Apre un ticket per il supporto tecnico, apri solo con risposta affermativa dell'utente"


Questa capacità permette all'assistente di determinare quando una richiesta:
- Contiene problematiche multi-livello difficili da risolvere automaticamente
- Richiede interventi personalizzati non standardizzabili
- Riguarda casi di eccezione non coperti dalle procedure automatizzate

### 11.1.2 Rilevamento di Errori Operativi

Il sistema monitora attivamente gli esiti delle operazioni tecniche eseguite tramite function calling. In `openai-handlers.ts`, la funzione `executeTool` incorpora gestione degli errori che può portare all'escalation automatica quando:

1. Una funzione tecnica fallisce ripetutamente
2. Vengono rilevati errori inattesi durante l'esecuzione di un'operazione
3. Le risposte dalle API Konsolex indicano problematiche che richiedono intervento specialistico

### 11.1.3 Escalation Esplicita Utente

Oltre al rilevamento automatico, il sistema supporta l'escalation esplicita richiesta dall'utente. L'assistente è addestrato a riconoscere richieste dirette di supporto umano e a verificarne l'intenzionalità prima di procedere, come evidenziato dalle istruzioni nella definizione di `openTicket`: "apri solo con risposta affermativa dell'utente".

Questo approccio multi-livello al rilevamento garantisce che le problematiche complesse vengano opportunamente indirizzate agli operatori umani, mantenendo al contempo un'elevata efficienza attraverso l'automazione delle richieste standard.

## 11.2 Creazione e Routing dei Ticket

Una volta identificata la necessità di intervento umano, il sistema implementa un processo strutturato di creazione e routing dei ticket, garantendo la corretta registrazione del problema e la sua assegnazione agli operatori appropriati.

### 11.2.1 Struttura e Creazione del Ticket

I ticket sono implementati come entità specializzate nel sistema, con una relazione diretta con i messaggi della conversazione. In `endpoint.ts`, la funzione `sendMessageToAdmin` è responsabile della creazione del ticket e della sua strutturazione:

1. Estrae il contesto utente e il contenuto della richiesta
2. Genera un messaggio strutturato che include identificativo utente e descrizione problema
3. Aggiorna lo stato del messaggio di origine utilizzando `updateTicketStatusByMsgId`
4. Crea o aggiorna il ticket attraverso `getOrCreateTicket`

Il ticket mantiene riferimenti sia all'utente che ai messaggi correlati, facilitando la visualizzazione completa del contesto conversazionale per gli operatori.

### 11.2.2 Meccanismo di Caching per Performance

Il sistema implementa un meccanismo di caching attraverso il modulo `ticketsCashe.ts` per garantire prestazioni ottimali anche con un elevato numero di ticket. Questo approccio:

1. Mantiene in memoria i ticket attivi per risposte rapide
2. Sincronizza periodicamente con il database per persistenza
3. Fornisce funzioni specifiche come `findTicket`, `getAllOpenTickets` e `closeTicket`

Questo equilibrio tra memoria e persistenza consente al sistema di gestire efficacemente picchi di richieste senza compromettere l'affidabilità.

### 11.2.3 Routing verso gli Amministratori

Il sistema implementa un routing intelligente dei ticket verso gli amministratori attraverso molteplici canali:

1. **Notifiche Telegram**: La funzione `sendMessageToAdmin` in `endpoint.ts` invia notifiche immediate agli amministratori attraverso Telegram, con bottoni interattivi per azioni rapide.

2. **Dashboard Web**: I ticket vengono resi disponibili attraverso l'API REST definita in `web-server.ts`, con endpoint come `ADMIN_API.ADMIN_TICKET_LIST` che forniscono accesso strutturato all'interfaccia amministrativa.

Questo approccio multi-canale garantisce che gli amministratori vengano prontamente informati dei nuovi ticket, indipendentemente dal dispositivo o dall'interfaccia che stanno utilizzando.

<img src="../diagrams/ticketing/ticket-creation-flow.png"
    alt="Ticket Creation Flow Diagram"
    width="800"
    align="center" />

## 11.3 Interfaccia Amministrativa

L'interfaccia amministrativa rappresenta il punto di contatto principale tra gli operatori umani e il sistema di ticketing, offrendo strumenti completi per la gestione efficiente delle richieste di supporto.

### 11.3.1 Interfaccia Telegram

Per gli amministratori, il bot Telegram offre un'interfaccia immediata e mobile-friendly per la gestione dei ticket, implementata in diverse parti del codice:

1. **Notifiche Strutturate**: In `endpoint.ts`, la funzione `sendMessageToAdmin` costruisce messaggi informativi con dettagli dell'utente e della richiesta.

2. **Bottoni Interattivi**: Le notifiche includono bottoni definiti nella variabile `inlineKeyboard` per azioni rapide come:
   - Risposta al ticket (`ReplyToTicket`)
   - Chiusura del ticket (`CloseTicket`)
   - Visualizzazione dei messaggi utente (`ShowUserMessages`)

3. **Flusso di Risposta**: Il sistema facilita un flusso di risposta naturale, con gli operatori che possono rispondere direttamente dal client Telegram.

### 11.3.2 Dashboard Web

Complementare all'interfaccia Telegram, il sistema implementa una dashboard web accessibile tramite le API REST definite in `web-server.ts`:

1. **Lista Ticket**: L'endpoint `ADMIN_API.ADMIN_TICKET_LIST` fornisce un elenco completo dei ticket aperti, ordinati per priorità e data.

2. **Visualizzazione Dettagli**: Gli admin possono accedere al contesto completo della conversazione tramite l'endpoint `ADMIN_API.GET_REPLAY_ADMIN_USER`.

3. **Gestione Ticket**: Gli endpoint `ADMIN_API.ADMIN_REPLY_TICKET` e `ADMIN_API.CLOSE_TICKET` implementano le azioni principali di gestione.

La dashboard web è progettata per sessioni più estese di gestione ticket, offrendo visualizzazioni dettagliate e strumenti avanzati che complementano le funzionalità più immediate dell'interfaccia Telegram.

### 11.3.3 Visualizzazione del Contesto

Un elemento distintivo dell'interfaccia amministrativa è la capacità di presentare il contesto completo della conversazione, cruciale per una risposta efficace. Implementato in `web-server.ts` attraverso l'endpoint `API.GET_TICKETS_MESSAGES_USER`, il sistema:

1. Recupera tutti i messaggi relativi al ticket, inclusi i messaggi utente, le risposte AI e gli eventuali tentativi precedenti di risoluzione
2. Organizza cronologicamente la conversazione
3. Evidenzia passaggi critici come operazioni tecniche tentate o fallite

Questa visione completa del contesto riduce significativamente il tempo necessario per comprendere la problematica e fornire una risposta appropriata.

## 11.4 Diagrammi dei Processi

### 11.4.1 Activity Diagram per Ciclo di Vita del Ticket

Il seguente diagramma illustra il ciclo di vita completo di un ticket, dall'identificazione iniziale del problema alla risoluzione finale e chiusura.

<img src="../diagrams/ticketing/ticket-lifecycle-activity.png"
    alt="Ticket Lifecycle Activity Diagram"
    width="700"
    align="center" />

Il diagramma evidenzia:
- I diversi punti di ingresso nel sistema di ticketing (rilevamento automatico, richiesta esplicita)
- Gli stati che un ticket attraversa durante il suo ciclo di vita
- I punti decisionali che determinano la sua evoluzione
- Le azioni degli attori coinvolti (utente, AI, amministratore)

### 11.4.2 Sequence Diagram per Gestione Ticket tra AI e Operatori

Il seguente diagramma di sequenza illustra in dettaglio le interazioni tra i vari componenti del sistema durante la gestione di un ticket.

<img src="../diagrams/ticketing/ticket-interaction-sequence.png"
    alt="Ticket Interaction Sequence Diagram"
    width="900"
    align="center" />

Il diagramma mostra:
- La sequenza temporale delle operazioni coinvolte nella gestione ticket
- La comunicazione tra i diversi componenti del sistema
- Il flusso di dati e controllo durante l'intero processo
- I momenti di sincronizzazione tra i processi automatici e l'intervento umano

## 11.5 Notifiche e Aggiornamenti

Il sistema implementa un sofisticato meccanismo di notifiche per mantenere tutti gli attori coinvolti (utenti e amministratori) aggiornati sullo stato dei ticket e sulle interazioni correlate.

### 11.5.1 Notifiche per Amministratori

Le notifiche per gli amministratori sono implementate principalmente in `endpoint.ts` attraverso la funzione `sendMessageToAdmin`:

1. **Notifiche Real-time**: Gli amministratori ricevono notifiche immediate su Telegram quando:
   - Viene creato un nuovo ticket
   - Un utente aggiunge ulteriori informazioni a un ticket esistente
   - Si verificano eventi critici che richiedono attenzione

2. **Contenuto Strutturato**: Le notifiche includono informazioni critiche come:
   - Identificativo dell'utente e username quando disponibile
   - Descrizione sintetica del problema
   - Tempo trascorso dall'ultimo aggiornamento

3. **Azioni Rapide**: Attraverso l'implementazione di `inlineKeyboard`, le notifiche includono bottoni che consentono azioni immediate come rispondere o chiudere il ticket.

### 11.5.2 Aggiornamenti per Utenti

Gli utenti vengono mantenuti informati attraverso funzionalità implementate principalmente in `aux-functions.ts` con la funzione `sendAdminReplyToUser`:

1. **Conferme di Apertura Ticket**: Gli utenti ricevono conferma quando un loro problema viene escalato a ticket, con un messaggio generato dall'AI che spiega il processo.

2. **Notifiche di Risposta**: Quando un amministratore risponde al ticket, l'utente riceve una notifica formattata che:
   - Evidenzia chiaramente la provenienza dalla squadra di supporto
   - Mantiene il formato della risposta per massima leggibilità
   - Include eventuali istruzioni o richieste di informazioni aggiuntive

3. **Aggiornamenti di Stato**: Il sistema informa l'utente quando il ticket viene chiuso o risolto, con un riepilogo delle azioni intraprese.

### 11.5.3 Sincronizzazione Multi-canale

Un aspetto distintivo del sistema è la capacità di sincronizzare le notifiche tra diverse interfacce:

1. **Telegram ↔ Web**: Le interazioni che avvengono su un canale si riflettono automaticamente sull'altro, grazie al hook `KONSOLEX_ENDPOINT.MESSAGES_UPDATE` chiamato dopo ogni aggiornamento significativo.

2. **Coerenza dei Dati**: Il sistema garantisce che lo stato del ticket e i relativi messaggi siano consistenti su tutte le interfacce, indipendentemente dal canale utilizzato per l'interazione.

Questa sincronizzazione multi-canale consente una gestione fluida dei ticket anche in scenari in cui gli operatori passano da un'interfaccia all'altra durante il processo di risoluzione.

## 11.6 Meccanismi di Chiusura e Feedback

Il sistema implementa approcci strutturati per la chiusura dei ticket e la raccolta di feedback, fondamentali per il miglioramento continuo del servizio.

### 11.6.1 Processo di Chiusura Ticket

La chiusura dei ticket è gestita attraverso funzionalità implementate in `web-server.ts` e nel modulo `ticketsCashe.ts`:

1. **Chiusura da Interfaccia Admin**: Gli amministratori possono chiudere esplicitamente un ticket attraverso:
   - L'endpoint `ADMIN_API.CLOSE_TICKET` nella dashboard web
   - Il bottone di callback `CallbackQuery.closeTicket` nell'interfaccia Telegram

2. **Risoluzione Implicita**: Il sistema supporta anche la chiusura implicita quando:
   - Il problema è stato risolto come confermato dall'utente
   - Non ci sono state interazioni per un periodo prolungato dopo una risposta risolutiva

3. **Aggiornamento Stati**: La funzione `closeTicket` in `ticketsCashe.ts` si occupa di:
   - Aggiornare lo stato del ticket a "chiuso"
   - Registrare il timestamp di chiusura
   - Notificare tutte le parti coinvolte

### 11.6.2 Raccolta e Analisi Feedback

Il sistema implementa meccanismi di feedback per la valutazione della qualità del supporto:

1. **Feedback Esplicito**: In fase di chiusura ticket, il sistema può richiedere all'utente una valutazione dell'assistenza ricevuta, registrata nelle entità `Score`.

2. **Analisi Implicita**: Il sistema analizza anche indicatori impliciti della qualità del supporto, come:
   - Tempo di risoluzione
   - Numero di interazioni necessarie
   - Pattern di escalation ricorrenti

Questi dati vengono archiviati per analisi successive e per il miglioramento continuo delle capacità dell'assistente AI.

### 11.6.3 Apprendimento e Ottimizzazione

Le informazioni raccolte durante il ciclo di vita dei ticket vengono utilizzate per ottimizzare il sistema attraverso:

1. **Aggiornamento Knowledge Base**: Problematiche ricorrenti risolte con successo dagli operatori umani possono essere incorporate nella knowledge base dell'AI.

2. **Ottimizzazione Prompt**: I pattern di escalation vengono analizzati per raffinare le capacità di rilevamento automatico dell'AI.

3. **Miglioramento Function Calling**: L'analisi dei fallimenti delle funzioni automatiche guida lo sviluppo di nuove funzionalità di automazione.

Questo ciclo continuo di feedback e miglioramento consente al sistema di evolvere nel tempo, automatizzando progressivamente anche problematiche inizialmente gestite solo tramite intervento umano.

## 11.7 Conclusioni sul Sistema di Ticketing

Il sistema di ticketing rappresenta un elemento fondamentale dell'architettura complessiva, fungendo da ponte essenziale tra l'automazione dell'AI e la competenza umana. La sua implementazione riflette un approccio equilibrato che:

1. Massimizza l'efficienza attraverso l'automazione delle richieste standard
2. Garantisce qualità e precisione nelle risposte a problematiche complesse tramite l'intervento umano
3. Fornisce un'esperienza utente coerente e fluida attraverso l'intera catena di supporto

La stretta integrazione tra il sistema di ticketing e gli altri componenti dell'architettura crea un continuum di supporto che si adatta dinamicamente alla complessità delle richieste, offrendo il livello appropriato di assistenza per ogni scenario.


