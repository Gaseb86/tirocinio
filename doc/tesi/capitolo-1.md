# Capitolo 1: Introduzione e Contesto

## 1.1 Abstract del Progetto

Il presente progetto di tesi illustra la progettazione, lo sviluppo e l'implementazione di un sistema di chatbot basato su intelligenza artificiale per il supporto tecnico dell'azienda OnTheCloud Srl.

Il sistema integra le capacità di elaborazione del linguaggio naturale di OpenAI GPT-4 con l'interfaccia di messaggistica della piattaforma cloud Konsolex e Telegram per fornire assistenza tecnica automatizzata agli utenti Konsolex.

La soluzione sviluppata affronta la sfida critica di fornire supporto tecnico di qualità 24/7 con risorse limitate, implementando meccanismi di risposta automatica per problematiche comuni e sull'intrfaccia Konsolex, esecuzione diretta di operazioni tecniche e un sistema di escalation verso operatori umani quando necessario.

Attraverso un'architettura modulare implementata in TypeScript e Node.js, il sistema dimostra come l'intelligenza artificiale possa essere efficacemente integrata nei processi di supporto tecnico per migliorare l'efficienza operativa, ridurre i tempi di risposta e standardizzare le soluzioni proposte.

## 1.2 Contesto Aziendale: OnTheCloud e Konsolex

OnTheCloud Srl è una realtà innovativa nel panorama italiano dei servizi cloud, fondata nel 2020 con l'obiettivo di semplificare la gestione dell'infrastruttura IT per piccole e medie imprese, software house e web agency. L'azienda si distingue per un approccio orientato alla semplificazione dei processi e all'ottimizzazione delle risorse cloud, con un focus particolare sul mercato B2B.

I principali elementi distintivi di OnTheCloud sono:
- Tecnologia Human-Friendly accessibile a utenti con diversi livelli di competenza
- Soluzioni altamente personalizzate sulle specifiche esigenze dei clienti
- Approccio proattivo al supporto tecnico
- Team di professionisti con esperienza verificata nel cloud computing
- Sviluppo di soluzioni proprietarie che integrano le migliori tecnologie disponibili

Il cuore dell'offerta tecnologica è rappresentato da Konsolex, una piattaforma proprietaria che funge da sistema operativo cloud unificato, caratterizzata da:
- Gestione centralizzata di domini, server, container, email e applicazioni
- Integrazione multi-provider con diversi fornitori cloud
- Automazione avanzata per ottimizzare operazioni ricorrenti
- Monitoraggio in tempo reale con alert personalizzabili
- Sicurezza integrata come parte nativa della piattaforma
- Funzionalità white-label e multi-tenant per partner e agenzie

Konsolex risponde alla frammentazione degli strumenti di gestione cloud, semplificando il lavoro degli amministratori IT e riducendo la complessità operativa con un'evoluzione costante delle sue funzionalità.

## 1.3 Sfide del Supporto Tecnico nel Cloud B2B

Il settore del cloud B2B presenta numerose sfide per il supporto tecnico, particolarmente critiche per aziende con team tecnici limitati come OnTheCloud.

### Complessità e Criticità

I clienti business operano con architetture complesse che integrano server virtuali e dedicati, database distribuiti, containerizzazione, configurazioni di rete avanzate e sistemi di sicurezza multi-livello. I servizi cloud rappresentano elementi mission-critical dove:
- Downtime anche brevi comportano significative perdite economiche
- Problemi di prestazioni impattano direttamente sulla produttività
- Vulnerabilità di sicurezza espongono a rischi reputazionali e legali

Questo scenario richiede supporto 24/7, tempi di risposta rapidi e garanzie di servizio stringenti, oltre a un approccio proattivo al monitoraggio e alla risoluzione dei problemi.

### Limitazioni Operative

Per un team tecnico limitato (2-10 persone), le principali sfide includono:
- Difficoltà nella copertura continuativa 24/7
- Necessità di competenze estremamente diversificate (sistemi operativi, networking, sicurezza, database, containerizzazione)
- Complessa gestione della knowledge base e del trasferimento di conoscenza
- Scalabilità del supporto con l'aumento della base clienti
- Bilanciamento tra supporto reattivo e sviluppo proattivo

Il tradizionale approccio di scalare semplicemente aumentando il personale non risulta sostenibile per aziende in rapida crescita, richiedendo una ripensamento del modello di erogazione del supporto.

## 1.4 Vantaggi dell'Automazione tramite AI

L'integrazione dell'intelligenza artificiale nel supporto tecnico emerge come soluzione strategica con importanti vantaggi:

### Disponibilità e Standardizzazione
- Operatività 24/7 senza interruzioni
- Gestione simultanea di multiple richieste con tempi di risposta consistenti
- Risposte coerenti basate sulle best practice documentate
- Riduzione della variabilità dovuta a differenze tra operatori

### Gestione Intelligente
- Identificazione autonoma dei casi che richiedono intervento umano
- Raccolta di informazioni preliminari prima dell'escalation
- Accesso rapido a vaste knowledge base con identificazione delle informazioni rilevanti
- Sintesi di informazioni da fonti diverse con applicazione consistente delle procedure

L'automazione consente agli operatori umani di concentrarsi sui problemi complessi che richiedono creatività, dedicare più tempo ai clienti strategici e contribuire allo sviluppo di nuove soluzioni. L'obiettivo non è sostituire il supporto umano, ma potenziarlo, consentendo al team tecnico di focalizzarsi sulle attività a maggior valore aggiunto.

## 1.5 Obiettivi del Progetto

Il progetto si pone una serie di obiettivi strategici e tecnici per affrontare le sfide del supporto tecnico identificate:

1. **Automazione di primo livello per richieste comuni**: Sviluppare un sistema in grado di rispondere autonomamente alle richieste di supporto più frequenti, implementato attraverso l'integrazione con OpenAI GPT-4 e un insieme di funzioni specializzate per operazioni tecniche come il riavvio di server o il controllo dello stato dei domini.

2. **Riduzione del carico di lavoro per gli operatori**: Alleviare il team di supporto dalle attività ripetitive attraverso filtri automatici delle richieste, preparazione preventiva dei ticket complessi e automazione delle operazioni di raccolta informazioni. L'obiettivo è ridurre del 60-70% il tempo dedicato al supporto standard.

3. **Miglioramento dei tempi di risposta**: Garantire feedback immediato agli utenti, con tempi di prima risposta inferiori a 2 secondi nel 95% dei casi, attraverso processamento asincrono e ottimizzazione delle query al database.

4. **Standardizzazione delle soluzioni**: Assicurare uniformità e coerenza nelle risposte tecniche fornite, seguendo best practice definite e garantendo formattazione consistente delle informazioni.

5. **Sistema di escalation intelligente**: Riconoscere i limiti dell'automazione e trasferire fluidamente le richieste complesse agli operatori umani, preservando il contesto della conversazione e facilitando la transizione.

6. **Integrazione con sistemi esistenti**: Garantire una perfetta integrazione con l'ecosistema tecnologico di OnTheCloud, in particolare con la piattaforma Konsolex, attraverso sincronizzazione degli utenti, notifiche bidirezionali e autenticazione unificata.

Questi obiettivi, implementati attraverso un'architettura modulare, rappresentano un approccio innovativo che combina automazione intelligente e intervento umano per creare un ecosistema di supporto tecnico equilibrato ed efficiente.

I capitoli successivi esploreranno in dettaglio l'implementazione tecnica di questa soluzione, analizzando le scelte architetturali, i pattern di progettazione adottati e i risultati ottenuti.
