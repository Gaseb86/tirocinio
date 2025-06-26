# Capitolo 2: Requisiti di Sistema

La definizione dettagliata dei requisiti ha rappresentato una fase cruciale nello sviluppo del chatbot AI per il supporto tecnico. Questo capitolo descrive le specifiche funzionali e non funzionali che il sistema deve soddisfare, derivate sia dall'analisi del problema descritta nel capitolo precedente, sia dalle esigenze specifiche di OnTheCloud e della piattaforma Konsolex.

## 2.1 Requisiti Funzionali

I requisiti funzionali descrivono le capacità e i servizi che il sistema deve fornire. Sono stati organizzati in categorie logiche che riflettono le principali aree di funzionalità del chatbot.

### 2.1.1 Gestione Automatica delle Richieste di Supporto Tecnico

Il sistema deve essere in grado di gestire in modo autonomo una vasta gamma di richieste di supporto tecnico, fornendo risposte coerenti, accurate e tempestive. Specificamente, deve:

- **RF-1.1**: Ricevere e interpretare richieste in linguaggio naturale riguardanti problemi tecnici sulla piattaforma Konsolex
- **RF-1.2**: Analizzare il contenuto della richiesta per identificarne il tipo (server, dominio, email, container, ecc.)
- **RF-1.3**: Generare risposte tecnicamente accurate basate sulla knowledge base disponibile
- **RF-1.4**: Mantenere il contesto della conversazione per riferimenti successivi
- **RF-1.5**: Evitare di dare risposte prese al di fuori della knowledge base.

### 2.1.2 Interfaccia Conversazionale Multicanale

Il sistema deve fornire un'interfaccia conversazionale coerente e accessibile attraverso diversi canali. In particolare:

- **RF-2.1**: Fornire un'interfaccia di chat tramite Telegram accessibile da dispositivi mobili e desktop
- **RF-2.2**: Implementare un'interfaccia web integrata nella piattaforma Konsolex
- **RF-2.3**: Mantenere uno storico delle conversazioni

### 2.1.3 Sistema di Knowledge Base per Risposte Tecniche

Il sistema deve utilizzare una knowledge base strutturata e facilmente aggiornabile per fornire risposte tecniche accurate:

- **RF-3.1**: Utilizzare un supporto per archiviare e recuperare informazioni tecniche
- **RF-3.2**: Organizzare la knowledge base in categorie logiche
- **RF-3.3**: Implementare meccanismi per l'aggiornamento della knowledge base
- **RF-3.4**: Tracciare l'utilizzo della knowledge base per identificare lacune informative

### 2.1.4 Meccanismo di Escalation verso Operatori Umani attraverso sistema di ticket

Il sistema deve riconoscere i propri limiti e facilitare una transizione fluida verso l'assistenza umana attraverso un sistema di ticket quando necessario:

- **RF-4.1**: Identificare automaticamente situazioni che richiedono intervento umano
- **RF-4.2**: Implementare un sistema di escalation che preservi il contesto della conversazione
- **RF-4.3**: Notificare gli amministratori di nuove richieste di escalation
- **RF-4.4**: Consentire il passaggio fluido tra AI e operatori umani nella stessa conversazione

### 2.1.5 Sistema di Ticketing Integrato

Il sistema deve includere un sistema di ticketing completo per gestire le richieste che richiedono intervento umano:

- **RF-5.1**: Gestire stati dei ticket (aperto, in attesa, risolto, ecc.)
- **RF-5.2**: Fornire un'interfaccia amministrativa per la gestione dei ticket

### 2.1.6 Operazioni Tecniche Eseguibili tramite AI

Il sistema deve essere in grado di eseguire direttamente una serie di operazioni tecniche sulla piattaforma Konsolex:

- **RF-6.1**: Aprire un ticket di supporto
- **RF-6.2**: Controllare la lista dei server di un utente
- **RF-6.3**: Controllare la lista dei domini di un utente
- **RF-6.4**: Controllare la lista dei siti di un utente
- **RF-6.5**: Riavviare un server
- **RF-6.6**: Riavviare il servizio MySql su un determinato server

### 2.1.7 Dashboard Amministrativa per Monitoraggio

Il sistema deve fornire una dashboard amministrativa per il monitoraggio e la gestione dell'intero sistema:

- **RF-7.1**: Monitorare lo stato di ticket aperti e richieste di supporto
- **RF-7.2**: Fornire accesso alla gestione utenti e conversazioni

## 2.2 Requisiti Non Funzionali

I requisiti non funzionali definiscono qualità e vincoli del sistema, focalizzandosi su come il sistema deve operare piuttosto che su cosa deve fare.

### 2.2.1 Performance

- **RNF-1.1**: Il tempo di risposta del sistema deve essere inferiore a 30 secondi
- **RNF-1.2**: Il sistema deve implementare timeout appropriati per prevenire attese eccessive

### 2.2.2 Scalabilità

- **RNF-2.1**: L'architettura deve supportare la crescita lineare degli utenti senza richiedere modifiche architetturali significative
- **RNF-2.2**: Il sistema deve gestire picchi di carico fino a 5 volte il carico medio
- **RNF-2.3**: L'aggiunta di nuove funzionalità o categorie nella knowledge base deve essere possibile senza interruzioni
- **RNF-2.4**: L'architettura deve consentire l'aggiunta di nuovi canali di comunicazione con minime modifiche

### 2.2.3 Affidabilità

- **RNF-3.1**: Il sistema deve essere disponibile 24/7 con un uptime target del 99.9%
- **RNF-3.2**: Nessun singolo punto di fallimento deve compromettere l'intero sistema
- **RNF-3.3**: Il sistema deve mantenere backup regolari di tutti i dati critici

### 2.2.4 Sicurezza

- **RNF-4.1**: Il sistema deve implementare controlli sulla lunghezza dell'input da parte utente e output da parte Openai, per ridurre i costi.

### 2.2.5 Usabilità

- **RNF-5.1**: Le risposte devono essere formattate in modo leggibile anche su dispositivi mobili

### 2.2.6 Manutenibilità

- **RNF-6.1**: Il codice deve seguire standard di codifica consistenti e best practices
- **RNF-6.2**: L'architettura deve essere modulare con componenti disaccoppiati
- **RNF-6.3**: Il sistema deve includere logging dettagliato per facilitare debug e diagnostica

### 2.2.7 Integrazione con Sistemi Esistenti

- **RNF-7.1**: Il sistema deve integrarsi con l'API Konsolex esistente senza richiedere modifiche a quest'ultima
- **RNF-7.2**: L'integrazione con Telegram deve supportare tutte le funzionalità necessarie
- **RNF-7.3**: L'integrazione con OpenAI deve essere resiliente ai cambiamenti nell'API


Questi requisiti hanno guidato le scelte architetturali e tecnologiche descritte nei capitoli successivi, assicurando che il sistema sia non solo funzionalmente adeguato ma anche praticamente implementabile nell'ecosistema aziendale esistente.

