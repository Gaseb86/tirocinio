# CHATBOT AI PER IL SUPPORTO TECNICO: INTEGRAZIONE DI OPENAI CON PIATTAFORME DI COMUNICAZIONE AZIENDALE

## ABSTRACT

Questa tesi illustra la progettazione, lo sviluppo e l'implementazione di un sistema di assistenza tecnica basato su intelligenza artificiale per l'azienda OnTheCloud Srl. Il progetto integra le capacità di elaborazione del linguaggio naturale di OpenAI GPT-4 con un'interfaccia di comunicazione multicanale, principalmente basata su Telegram, per fornire supporto tecnico automatizzato agli utenti della piattaforma Konsolex. Attraverso l'adozione di una architettura modulare implementata in TypeScript e Node.js, il sistema dimostra come le moderne tecnologie di AI possano essere efficacemente impiegate per migliorare l'efficienza operativa e la qualità del servizio di assistenza tecnica, garantendo al contempo scalabilità e facilità di manutenzione. L'elaborato analizza in dettaglio le scelte architetturali, le soluzioni tecniche implementate e i risultati ottenuti, offrendo una prospettiva completa sulle potenzialità dell'integrazione tra intelligenza artificiale e sistemi di supporto tecnico.

## CAPITOLO 1: INTRODUZIONE E CONTESTO

### 1.1 Contesto Aziendale

OnTheCloud Srl rappresenta una realtà emergente nel panorama italiano dei servizi cloud B2B. Fondata nel 2022, l'azienda ha rapidamente consolidato la propria posizione nel mercato grazie a un approccio distintivo che combina tecnologie all'avanguardia con una particolare attenzione all'usabilità e all'accessibilità dei servizi offerti.

Il core business dell'azienda si concentra sulla fornitura di soluzioni cloud avanzate, principalmente indirizzate a tre segmenti di mercato: aziende ICT, software house e web agency. Questa specializzazione ha permesso a OnTheCloud di sviluppare un'offerta particolarmente mirata, che si distingue per la capacità di rispondere alle esigenze tecniche specifiche di questi settori professionali.

Al centro dell'ecosistema tecnologico dell'azienda si trova Konsolex, una piattaforma proprietaria che funge da punto centralizzato per la gestione di un'ampia gamma di servizi: domini, server, container e applicazioni. Questa piattaforma rappresenta non solo uno strumento operativo, ma un vero e proprio vantaggio competitivo, offrendo agli utenti un'interfaccia unificata che semplifica notevolmente la gestione delle infrastrutture cloud.

L'approccio distintivo di OnTheCloud si articola su diversi pilastri fondamentali:

- **Democratizzazione della tecnologia cloud**: L'azienda ha investito significativamente nello sviluppo di interfacce intuitive che rendono accessibili tecnologie complesse anche a utenti con competenze tecniche limitate.

- **Innovazione tecnica**: La piattaforma incorpora funzionalità avanzate come l'automigrazione dinamica e sistemi di scalabilità automatica, che rappresentano lo stato dell'arte nel settore.

- **Flessibilità organizzativa**: L'implementazione di funzionalità White-Label e Teams permette ai clienti di personalizzare l'esperienza in base alle proprie esigenze organizzative.

- **Supporto multicanale**: L'azienda ha strutturato un sistema di assistenza che opera attraverso diversi canali di comunicazione, garantendo disponibilità continua 24/7.

Questo contesto aziendale ha rappresentato sia l'ambiente che la motivazione per lo sviluppo del sistema di chatbot AI oggetto della presente tesi.

### 1.2 Problematica Affrontata

Il supporto tecnico costituisce un elemento cruciale nell'offerta di valore di OnTheCloud, rappresentando spesso il punto di contatto più significativo tra l'azienda e i suoi clienti. Tuttavia, questa componente presenta una serie di sfide operative che impattano sia sulla qualità del servizio che sull'efficienza aziendale:

**Complessità e varietà delle richieste**: Gli utenti della piattaforma Konsolex incontrano problematiche di natura estremamente eterogenea, che spaziano dalla configurazione DNS alla gestione dei container, dalla risoluzione di problemi di connettività all'ottimizzazione delle performance server. Questa varietà richiede competenze tecniche diversificate e approfondite.

**Necessità di disponibilità continua**: La natura critica dei servizi cloud impone una disponibilità del supporto tecnico 24/7, un requisito particolarmente impegnativo per un'azienda con un organico limitato (2-10 dipendenti).

**Aspettative di tempestività**: Gli utenti professionali si aspettano risposte rapide, spesso entro pochi minuti dalla segnalazione di un problema, soprattutto in scenari di criticità elevata.

**Standardizzazione delle procedure**: La necessità di fornire risposte coerenti e tecnicamente accurate richiede un alto grado di standardizzazione delle procedure di troubleshooting, un obiettivo difficile da raggiungere quando il supporto è gestito da diversi operatori.

**Scalabilità limitata**: L'approccio tradizionale al supporto tecnico presenta problemi intrinseci di scalabilità, con un aumento lineare dei costi al crescere del volume delle richieste.

**Gestione della conoscenza**: La documentazione tecnica e le procedure di risoluzione rappresentano un patrimonio di conoscenza aziendale che deve essere costantemente aggiornato e reso facilmente accessibile agli operatori del supporto.

Queste problematiche si inseriscono in un contesto di crescita aziendale, dove la capacità di offrire un supporto tecnico di qualità deve evolversi di pari passo con l'espansione della base clienti, senza compromettere l'efficienza operativa o la qualità percepita del servizio.

### 1.3 Obiettivi del Progetto

Il progetto si propone di affrontare le problematiche identificate attraverso lo sviluppo di un sistema di assistenza tecnica basato su intelligenza artificiale, perseguendo una serie di obiettivi strategici e operativi ben definiti:

**Obiettivi primari**:

1. **Automazione del supporto di primo livello**: Sviluppare un chatbot in grado di rispondere autonomamente alle questioni tecniche più comuni, riducendo il carico di lavoro sugli operatori umani e permettendo loro di concentrarsi sulle problematiche più complesse.

2. **Integrazione multicanale**: Implementare il sistema in modo che sia accessibile attraverso i principali canali di comunicazione utilizzati dai clienti, con particolare focus su Telegram e interfaccia web Konsolex.

3. **Standardizzazione delle risposte**: Assicurare che le soluzioni tecniche fornite siano consistenti, accurate e allineate con le best practices aziendali, indipendentemente dal canale o dal momento della richiesta.

4. **Gestione intelligente dell'escalation**: Creare un sistema che sappia riconoscere i propri limiti e inoltrare le richieste complesse agli operatori umani in modo fluido e contestualizzato.

**Obiettivi secondari**:

1. **Apprendimento continuo**: Implementare meccanismi che permettano al sistema di migliorare costantemente basandosi sulle interazioni passate e sul feedback degli operatori.

2. **Analisi delle problematiche ricorrenti**: Utilizzare i dati raccolti dal sistema per identificare le problematiche più comuni e migliorare proattivamente la documentazione o i servizi offerti.

3. **Riduzione dei tempi di risposta**: Minimizzare i tempi di attesa per gli utenti, puntando a risposte immediate per le questioni più comuni.

4. **Miglioramento dell'esperienza utente**: Offrire un'interfaccia conversazionale naturale e intuitiva che faciliti la risoluzione dei problemi tecnici.

5. **Gestione della conoscenza centralizzata**: Creare un repository centralizzato di conoscenza tecnica che funga da fonte unica di verità per il chatbot e gli operatori umani.

Il raggiungimento di questi obiettivi si tradurrebbe in un significativo miglioramento dell'efficienza operativa del team di supporto, con conseguente riduzione dei costi e incremento della soddisfazione degli utenti.

### 1.4 Tecnologie Adottate

La realizzazione del sistema ha richiesto l'integrazione di diverse tecnologie all'avanguardia, selezionate in base alla loro adeguatezza rispetto agli obiettivi del progetto e alla compatibilità con l'infrastruttura esistente:

**OpenAI GPT-4**: Il cuore dell'intelligenza artificiale del sistema è rappresentato da GPT-4, scelto per le sue avanzate capacità di comprensione del linguaggio naturale e generazione di testo. Questa tecnologia permette al chatbot di interpretare correttamente le richieste degli utenti, anche quando formulate in modo impreciso o colloquiale, e di fornire risposte articolate e tecnicamente accurate. L'integrazione è stata realizzata attraverso l'API ufficiale OpenAI, utilizzando in particolare la funzionalità di Assistants che consente la gestione di conversazioni contestuali e l'esecuzione di funzioni (function calling).

**TypeScript e Node.js**: L'intero backend del sistema è stato sviluppato utilizzando TypeScript su runtime Node.js, una combinazione che offre numerosi vantaggi:
- Tipizzazione statica che riduce gli errori in fase di sviluppo
- Eccellente supporto per operazioni asincrone, cruciali per l'integrazione con API esterne
- Vasto ecosistema di librerie e framework
- Prestazioni adeguate per applicazioni server-side con carico variabile
- Facilità di deployment e gestione in ambienti cloud

**Express.js**: Per l'implementazione dell'API REST è stato adottato Express.js, un framework minimalista ma potente che ha permesso di strutturare il server web in modo modulare e manutenibile, semplificando la gestione delle rotte, dei middleware e delle richieste HTTP.

**Telegram Bot API**: L'interfaccia utente principale è stata implementata attraverso la piattaforma Telegram, utilizzando la libreria Telegraf che offre un'astrazione di alto livello per l'interazione con l'API ufficiale Telegram Bot. Questa scelta è stata motivata dalla popolarità di Telegram tra i clienti target e dalla ricchezza di funzionalità offerte per la creazione di interfacce conversazionali.

**Sequelize ORM**: Per l'interazione con il database MySQL è stato utilizzato Sequelize, un ORM (Object-Relational Mapping) che ha semplificato notevolmente le operazioni di persistenza e recupero dati, garantendo al contempo maggiore sicurezza e manutenibilità del codice.

**Vector Store per Knowledge Base**: La base di conoscenza tecnica è stata implementata utilizzando un sistema di vector store, che permette ricerche semantiche molto più sofisticate rispetto alle tradizionali ricerche basate su keyword. Questa tecnologia consente al chatbot di identificare documenti rilevanti anche quando la formulazione della domanda differisce significativamente dal contenuto del documento.

L'architettura complessiva è stata progettata seguendo i principi della modularità e della separazione delle responsabilità, facilitando così future estensioni e manutenzioni del sistema.

### 1.5 Ambito di Applicazione

Il chatbot AI è stato concepito per coprire un ampio spettro di scenari di supporto tecnico, riflettendo la varietà dei servizi offerti da OnTheCloud e le diverse problematiche che gli utenti possono incontrare:

**Gestione dell'interfaccia Konsolex**: Il sistema fornisce assistenza per la navigazione e l'utilizzo della piattaforma Konsolex, guidando gli utenti attraverso le varie funzionalità e aiutandoli a risolvere problemi di accesso o configurazione dell'interfaccia.

**Supporto per infrastrutture server**: Una componente significativa delle richieste di assistenza riguarda la gestione dei server, con problematiche che spaziano dal riavvio di servizi specifici (MySQL, Postfix) alla diagnosi di problemi di connettività, fino all'ottimizzazione delle performance. Il chatbot è stato addestrato per gestire diversi tipi di server:
- Container Docker gestiti tramite Konsolex
- Server web tradizionali basati su Apache
- Server Windows
- Server di posta elettronica basati su Zimbra

**Gestione domini e DNS**: Il sistema è in grado di assistere gli utenti in operazioni comuni relative ai domini, come la verifica della disponibilità, la configurazione DNS, la gestione dei record di posta elettronica e la risoluzione di problemi di propagazione.

**Supporto email**: Data la criticità dei servizi email per molti clienti, il chatbot include funzionalità specifiche per assistere nella diagnosi e risoluzione di problemi relativi alla configurazione di client email, problemi di delivery e gestione delle code di posta.

**Gestione certificati SSL**: Il sistema fornisce supporto per l'installazione, il rinnovo e la risoluzione di problemi relativi ai certificati SSL, un aspetto cruciale per la sicurezza dei siti web.

**Monitoraggio e manutenzione**: Il chatbot può assistere gli utenti nell'interpretazione dei dati di monitoraggio e nell'implementazione di procedure di manutenzione preventiva.

**Escalation intelligente**: Quando una richiesta supera le capacità del sistema automatizzato, il chatbot è progettato per facilitare un passaggio fluido verso l'assistenza umana, fornendo all'operatore tutto il contesto necessario per riprendere la conversazione senza costringere l'utente a ripetere le informazioni già fornite.

Questa ampia copertura funzionale permette al sistema di gestire in autonomia una percentuale significativa delle richieste di supporto, riducendo drasticamente il carico di lavoro sul team tecnico e migliorando i tempi di risposta per gli utenti.

## CAPITOLO 2: ARCHITETTURA DEL SISTEMA

### 2.1 Progettazione Architetturale

La progettazione dell'architettura del sistema ha rappresentato una fase cruciale del progetto, richiedendo un bilanciamento attento tra diversi requisiti spesso in contrasto tra loro: flessibilità, mantenibilità, performance e facilità di integrazione con i sistemi esistenti. L'approccio adottato si è basato su alcuni principi fondamentali:

**Modularità e separazione delle responsabilità**: Il sistema è stato scomposto in componenti funzionali distinti, ciascuno con responsabilità ben definite. Questa separazione migliora la manutenibilità e facilita l'evoluzione incrementale del sistema.

**Design guidato dalle interfacce**: Le interazioni tra i diversi componenti sono state definite attraverso interfacce chiare, riducendo l'accoppiamento e facilitando la sostituzione di implementazioni specifiche senza impattare il resto del sistema.

**Scalabilità orizzontale**: L'architettura è stata progettata per consentire una facile scalabilità attraverso l'aggiunta di nuove istanze dei componenti, piuttosto che richiedere l'upgrade delle risorse di una singola istanza.

**Resilienza e gestione degli errori**: Ogni componente include meccanismi di fallback e strategie di gestione degli errori, per garantire che il sistema nel suo complesso rimanga operativo anche in caso di malfunzionamento di componenti specifici o servizi esterni.

L'architettura risultante può essere descritta come un sistema distribuito composto da sei macro-componenti principali:

1. **Frontend**: Interfacce utente attraverso cui gli utenti interagiscono con il sistema (principalmente Telegram e potenzialmente interfaccia web integrata in Konsolex).

2. **Backend**: Server Node.js/Express che gestisce le richieste HTTP, coordina gli altri componenti e implementa la logica di business.

3. **AI Engine**: Componente responsabile dell'interazione con OpenAI, della gestione del contesto conversazionale e dell'interpretazione delle risposte.

4. **Knowledge Base**: Repository di documenti tecnici e procedure organizzati per facilitare la ricerca semantica.

5. **Database**: Layer di persistenza per utenti, conversazioni, ticket e metadati.

6. **Integration Layer**: Componente responsabile dell'interazione con sistemi esterni come la piattaforma Konsolex.

Questa architettura offre un buon compromesso tra complessità implementativa e flessibilità operativa, permettendo di evolvere singoli componenti senza impattare l'intero sistema.

### 2.2 Componenti Core

#### 2.2.1 Web Server (web-server.ts)

Il Web Server costituisce il cuore pulsante dell'applicazione, implementando l'API REST che funge da punto di ingresso per le comunicazioni con il frontend e con i sistemi esterni. Sviluppato utilizzando Express.js, questo componente svolge un ruolo cruciale di orchestrazione, coordinando il flusso di informazioni tra i vari moduli del sistema.

**Responsabilità principali**:

Il web server gestisce tre categorie principali di endpoint:

1. **API di gestione ticket**: Questi endpoint implementano la logica di creazione, aggiornamento e chiusura dei ticket di supporto, fungendo da interfaccia tra gli utenti e gli operatori del supporto tecnico. Particolarmente significativo è l'endpoint `ADMIN_REPLY_TICKET` che gestisce l'intera catena di operazioni necessarie quando un amministratore risponde a un ticket aperto: aggiornamento stato ticket, notifica all'utente, persistenza nel database e aggiornamento dell'interfaccia Konsolex.

2. **API di gestione utenti**: Questo gruppo di endpoint fornisce funzionalità per la gestione degli utenti, inclusa la creazione di nuovi profili, l'aggiornamento delle informazioni e la visualizzazione di dati aggregati. Gli endpoint come `GET_ALL_USERS` e `ALL_USERS_DATA` sono specificamente progettati per alimentare l'interfaccia Konsolex con i dati necessari alla visualizzazione del pannello amministrativo.

3. **API di gestione messaggi**: Questi endpoint gestiscono il flusso di messaggi tra utenti, sistema AI e amministratori. L'endpoint chiave `SEND_MESSAGE` implementa la logica di biforcazione che determina se un messaggio deve essere processato dall'AI o inoltrato a un operatore umano, basandosi sullo stato corrente della conversazione.

La gestione degli errori è implementata in modo consistente attraverso tutti gli endpoint, con meccanismi di validazione input, try-catch blocks e logging strutturato che facilitano il debugging e migliorano la resilienza del sistema.

**Integrazioni**:

Il web server si integra con numerosi altri componenti:

- **Database**: Attraverso i repository pattern, interagisce con il layer di persistenza per leggere e scrivere dati utente, messaggi e ticket.
- **OpenAI Handler**: Delega l'elaborazione delle richieste che richiedono comprensione del linguaggio naturale.
- **Telegram Bot**: Inizializza e comunica con il bot Telegram per notifiche e interazioni.
- **Konsolex API**: Comunica con la piattaforma Konsolex per sincronizzare stati e notifiche.

**Aspetti di sicurezza**:

Particolare attenzione è stata dedicata agli aspetti di sicurezza:

- Implementazione di CORS per gestire le richieste cross-origin
- Validazione rigorosa degli input per prevenire injection attacks
- Logging delle richieste per audit trail
- Gestione appropriata degli errori che non espone dettagli implementativi

La combinazione di queste caratteristiche rende il web server un componente robusto e flessibile, capace di evolvere per supportare nuove funzionalità mantenendo al contempo un'architettura pulita e manutenibile.

#### 2.2.2 OpenAI Handler (openai-handlers.ts)

Il modulo OpenAI Handler rappresenta il ponte tra l'applicazione e l'intelligenza artificiale di OpenAI, gestendo tutte le interazioni con l'API GPT-4. Questo componente implementa una logica sofisticata per mantenere il contesto delle conversazioni, gestire le richieste asincrone e interpretare le risposte dell'AI.

**Gestione dei thread conversazionali**:

Una delle funzionalità più importanti di questo modulo è la gestione dei thread di conversazione. Per ogni utente, il sistema mantiene un thread persistente che conserva il contesto delle interazioni precedenti, permettendo all'AI di fornire risposte contestualmente rilevanti. Il metodo `updateUserThreadAndAssistant` implementa la logica di gestione del ciclo di vita dei thread:

- Creazione automatica di nuovi thread quando necessario
- Reset dei thread dopo un periodo di inattività (4 ore)
- Associazione thread-utente nel database

**Comunicazione con OpenAI**:

Il metodo centrale `createReply` gestisce l'intero ciclo di vita di una richiesta all'AI:

1. Aggiunge il messaggio utente al thread appropriato
2. Configura e avvia un "run" dell'assistente con parametri ottimizzati
3. Monitora lo stato del run fino al completamento
4. Gestisce le richieste di azione (tool calls) quando l'AI necessita di eseguire funzioni esterne
5. Recupera e valida la risposta finale
6. Implementa strategie di fallback in caso di errore

**Function Calling**:

Una caratteristica distintiva dell'implementazione è il supporto per le "function calls", che permettono all'AI di richiamare funzioni predefinite per eseguire operazioni specifiche. Il modulo implementa un ricco set di funzioni che l'AI può invocare:

- `getDomainList`: Recupera l'elenco dei domini dell'utente
- `getServerList`: Ottiene la lista dei server disponibili
- `restartServer`: Esegue il riavvio di un server specifico
- `restartMysql`: Riavvia il servizio MySQL su un server
- `openTicket`: Crea un nuovo ticket di supporto

Questa capacità estende significativamente le possibilità dell'AI, permettendole di eseguire azioni concrete oltre a fornire informazioni testuali.

**Gestione errori e resilienza**:

Il modulo implementa una gestione errori multilivello:

- Timeout per evitare attese infinite
- Creazione automatica di nuovi thread in caso di fallimento
- Rilevamento di risposte non valide
- Strategie di comunicazione degli errori user-friendly

**Scoring e analisi della rilevanza**:

Il sistema implementa anche un meccanismo di scoring che valuta la pertinenza delle risposte dell'AI rispetto alle query degli utenti. Questo permette di:

- Identificare casi in cui l'AI sta fornendo risposte poco pertinenti
- Raccogliere dati per miglioramenti futuri del sistema
- Implementare logiche di fallback basate sulla qualità percepita delle risposte

L'OpenAI Handler rappresenta uno dei componenti più critici e tecnicamente sofisticati dell'intero sistema, implementando un'interfaccia tra l'applicazione e le capacità di intelligenza artificiale che ne costituiscono il cuore.

#### 2.2.3 Telegram Bot

Il modulo Telegram Bot implementa l'interfaccia utente principale del sistema, permettendo agli utenti di interagire con il chatbot di supporto attraverso la piattaforma di messaggistica Telegram. Sviluppato utilizzando la libreria Telegraf, questo componente traduce le interazioni testuali in chiamate API e gestisce la presentazione delle risposte.

**Funzionalità principali**:

- **Gestione comandi**: Il bot risponde a comandi standard come `/start` e `/help`, fornendo informazioni introduttive e guida all'utilizzo.

- **Processamento messaggi**: Ogni messaggio inviato dall'utente viene elaborato, contestualizzato e inoltrato al backend per l'elaborazione.

- **Interfaccia inline**: Implementazione di bottoni e menu interattivi che semplificano operazioni comuni e la navigazione tra le funzionalità.

- **Notifiche push**: Il bot invia notifiche proattive per aggiornamenti sui ticket o comunicazioni di sistema.

- **Gestione media**: Capacità di ricevere e processare contenuti multimediali come screenshot, utili per la diagnosi di problemi tecnici.

**Integrazione con il sistema**:

Il bot Telegram non opera isolatamente, ma è profondamente integrato con gli altri componenti del sistema:

- Comunica con il Web Server per inoltrare le richieste utente e ricevere le risposte
- Partecipa al flusso di gestione ticket, notificando gli utenti quando un amministratore risponde
- Mantiene la coerenza dell'esperienza utente tra diverse sessioni

**Considerazioni UX**:

Particolare attenzione è stata dedicata all'esperienza utente:

- Messaggi di attesa durante elaborazioni lunghe
- Formattazione dei messaggi per massimizzare la leggibilità
- Implementazione di shortcut per operazioni frequenti
- Feedback visivi per confermare azioni dell'utente

Il bot Telegram rappresenta il punto di contatto primario tra utenti e sistema, e la sua implementazione riflette l'importanza di offrire un'esperienza intuitiva e senza frizioni, anche quando si affrontano problematiche tecniche complesse.

#### 2.2.4 Endpoint Handler

Il modulo Endpoint Handler gestisce tutte le interazioni con API esterne, in particolare con la piattaforma Konsolex, fungendo da layer di astrazione che isola il resto del sistema dai dettagli implementativi specifici delle API di terze parti.

**Funzionalità principali**:

- **Operazioni sui server**: Implementa funzioni per gestire server, come riavvio, accensione, spegnimento e monitoraggio stato.

- **Gestione domini**: Fornisce metodi per verificare disponibilità domini, gestire DNS, aggiornare authinfo e altre operazioni correlate.

- **Operazioni container**: Supporta la gestione di container Docker, incluso riavvio, scaling e configurazione.

- **Sincronizzazione utenti**: Mantiene sincronizzate le informazioni utente tra il sistema chatbot e la piattaforma Konsolex.

**Gestione errori e resilienza**:

Il modulo implementa strategie di gestione errori specifiche per le API esterne:

- Retry automatici per errori temporanei
- Fallback a stati cached quando possibile
- Logging dettagliato per facilitare diagnosi di problemi di integrazione
- Normalizzazione degli errori per presentazione consistente all'utente

**Pattern di integrazione**:

L'implementazione segue pattern consolidati per l'integrazione con sistemi esterni:

- Adapter pattern per normalizzare le interfacce diverse
- Circuit breaker per prevenire cascate di errori
- Caching strategico per ridurre la dipendenza da servizi esterni
- Mapping bidirezionale tra i modelli di dati interni e quelli delle API esterne

La centralizzazione delle interazioni con API esterne in questo modulo semplifica significativamente l'evoluzione del sistema, permettendo di gestire cambiamenti nelle API esterne con impatto minimo sul resto dell'applicazione.

### 2.3 Gestione dei Dati

L'architettura di gestione dati del sistema è stata progettata per bilanciare diversi requisiti: prestazioni, consistenza, facilità di query e supporto per ricerche semantiche. Questo ha portato all'implementazione di una soluzione ibrida che combina un database relazionale tradizionale con un sistema di vector store per la knowledge base.

#### 2.3.1 Database Relazionale

Il sistema utilizza MySQL come database relazionale principale, gestito attraverso l'ORM Sequelize che fornisce un'astrazione orientata agli oggetti per le operazioni di database. Questa scelta offre un buon compromesso tra familiarità, prestazioni e facilità di manutenzione.

**Schema dati principale**:

La struttura dati è organizzata attorno a tre entità principali:

1. **User**: Memorizza informazioni sugli utenti, inclusi:
   - Identificativi (user_id, telegram_id)
   - Informazioni di contesto OpenAI (thread_id, assistant_id)
   - Dati di utilizzo (last_time_used)
   - Informazioni personali (username)

2. **Message**: Registra tutte le interazioni, con attributi quali:
   - Riferimenti (user_id, thread_id, assistant_id)
   - Contenuto (message, type)
   - Metadati (datetime, ticketOpen, ticket_id)

3. **Assistant**: Mantiene informazioni sugli assistenti virtuali configurati:
   - Identificativi (id, assistant_id)
   - Metadati presentazionali (name, img)

4. **Score**: Memorizza metriche di qualità per le risposte AI:
   - Query originale
   - Risposta generata
   - Score di rilevanza

**Repository pattern**:

L'interazione con il database è implementata seguendo il repository pattern, con moduli specializzati per ogni entità:

- `user-repository.ts`: Gestisce operazioni CRUD per gli utenti
- `message-repository.ts`: Implementa query specifiche per messaggi e conversazioni
- `score-repository.ts`: Memorizza e recupera dati di rilevanza e qualità

Questo approccio incapsula la logica di accesso ai dati, facilitando eventuali modifiche future allo schema o al sistema di persistenza.

#### 2.3.2 Vector Store per Knowledge Base

Per la gestione efficiente della base di conoscenza tecnica, è stato implementato un sistema di vector store che permette ricerche semantiche molto più sofisticate rispetto alle tradizionali ricerche basate su keyword.

**Funzionamento**:

1. I documenti tecnici vengono elaborati e trasformati in embedding vettoriali utilizzando modelli OpenAI.
2. Questi embedding catturano il significato semantico del testo, non solo le parole specifiche.
3. Le query degli utenti vengono similarmente trasformate in embedding.
4. Il sistema calcola la somiglianza tra la query e i documenti, identificando le informazioni più rilevanti.
5. Un punteggio di rilevanza viene utilizzato per decidere se la risposta è sufficientemente pertinente.

**Vantaggi dell'approccio**:

- Capacità di trovare informazioni rilevanti anche quando formulate con terminologia diversa
- Possibilità di ordinare i risultati per rilevanza semantica
- Supporto per domande parziali o imprecise
- Miglioramento continuo con l'aggiunta di nuovi documenti

L'architettura di gestione dati del sistema è stata progettata per bilanciare diversi requisiti: prestazioni, consistenza, facilità di query e supporto per ricerche semantiche. Questo ha portato all'implementazione di una soluzione ibrida che combina un database relazionale tradizionale con un sistema di vector store per la knowledge base.

### 2.4 Integrazione con Konsolex

Il sistema si integra profondamente con la piattaforma Konsolex attraverso:

- API REST per le operazioni di sistema
- Webhooks per gli aggiornamenti in tempo reale
- Sistema di autenticazione condiviso
- Sincronizzazione dello stato

## CAPITOLO 3: GESTIONE DELLE CONVERSAZIONI

### 3.1 Thread Management (openai-handlers.ts)

- Creazione thread per ogni utente
- Gestione del contesto conversazionale
- Timeout e reset automatico
- Persistenza delle conversazioni

### 3.2 Message Processing

- Validazione input utente
- Formattazione risposte AI
- Sistema di retry automatico
- Gestione errori conversazionali

## CAPITOLO 4: SISTEMA DI SUPPORTO TECNICO

### 4.1 Funzionalità Implementate

- Gestione server (restart, monitoring)
- Gestione domini (DNS, disponibilità)
- Supporto email
- Gestione container
- Gestione certificati SSL

### 4.2 Vector Store Knowledge Base

- Manuale tecnico dell'interfaccia di Konsolex
- ZIMBRA.txt: Soluzioni per server Zimbra
- WINDOWS.txt: Soluzioni per server Windows
- WEBSERVER.txt: Soluzioni per webserver
- CONTAINER_WEBSITE.txt: Gestione container
- DOMINI.txt: Gestione domini

## CAPITOLO 5: OPENAI FUNCTION SYSTEM

### 5.1 Tool Implementation

- File search per knowledge base
- Funzioni per operazioni server
- Funzioni per gestione domini
- Sistema ticket automatizzato

### 5.2 Response Generation

- Analisi delle richieste
- Selezione delle soluzioni appropriate
- Formattazione risposte
- Gestione fallback

## CAPITOLO 6: SISTEMA DI TICKETING

### 6.1 Ticket Management

- Creazione automatica ticket
- Routing verso amministratori
- Tracking dello stato
- Notifiche automatiche

### 6.2 Admin Interface

- Dashboard amministrativa
- Gestione utenti
- Monitoraggio ticket
- Risposta ai ticket

## CAPITOLO 7: SICUREZZA E AFFIDABILITÀ

### 7.1 Security Measures

- Autenticazione utenti
- Validazione input
- Rate limiting
- Logging sicuro

### 7.2 Error Handling

- Gestione errori API
- Recovery automatico
- Feedback utente
- Logging errori

## CAPITOLO 8: TESTING E MONITORAGGIO

### 8.1 Performance Metrics

- Tempi di risposta
- Accuratezza soluzioni
- Tasso di successo ticket
- Utilizzo risorse

### 8.2 Quality Assurance

- Test funzionali
- Validazione risposte
- Monitoraggio thread
- Analisi errori

## CAPITOLO 9: CONCLUSIONI E SVILUPPI FUTURI

### 9.1 Risultati Raggiunti

- Automazione supporto tecnico
- Riduzione tempi risposta
- Standardizzazione soluzioni
- Scalabilità sistema

### 9.2 Future Development

- Espansione knowledge base
- Miglioramento accuratezza AI
- Nuove funzionalità
- Ottimizzazioni performance

## APPENDICI

### A. Struttura del Codice

### B. API Documentation

### C. Knowledge Base Structure

### D. Test Cases