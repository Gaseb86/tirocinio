# Capitolo 1: Introduzione e Contesto

## 1.1 Abstract del Progetto

Il presente progetto di tesi illustra la progettazione e implementazione di un chatbot AI per il supporto tecnico di OnTheCloud Srl.

Il sistema integra le capacità di elaborazione del linguaggio naturale di OpenAI GPT-4 con l'interfaccia di messaggistica della piattaforma cloud Konsolex e Telegram per fornire assistenza tecnica automatizzata agli utenti Konsolex.

La soluzione sviluppata affronta la sfida critica di fornire supporto tecnico di qualità 24/7 con risorse limitate, implementando meccanismi di risposta automatica per problematiche comuni e sull'intrfaccia Konsolex, esecuzione diretta di operazioni tecniche e un sistema di escalation verso operatori umani quando necessario.

Attraverso un'architettura modulare implementata in TypeScript e Node.js, il sistema dimostra come l'intelligenza artificiale possa essere efficacemente integrata nei processi di supporto tecnico per migliorare l'efficienza operativa, ridurre i tempi di risposta e standardizzare le soluzioni proposte.

## 1.2 Contesto Aziendale: OnTheCloud e Konsolex

OnTheCloud Srl, fondata nel 2020, offre servizi cloud per piccole medie imprese, software house e web agency, semplificando la gestione dell'infrastruttura IT. L'azienda si distingue per un approccio orientato alla semplificazione dei processi e all'ottimizzazione delle risorse cloud, con un focus particolare sul mercato B2B.

Il cuore dell'offerta tecnologica è rappresentato da Konsolex, piattaforma proprietaria della società che funge da sistema operativo cloud unificato, caratterizzata dalla gestione centralizzata di domini, server, container, email e applicazioni

Konsolex risponde alla frammentazione degli strumenti di gestione cloud, semplificando il lavoro degli amministratori IT e riducendo la complessità operativa con un'evoluzione costante delle sue funzionalità.

## 1.3 Sfide del Supporto Tecnico nel Cloud B2B

Il supporto tecnico nel settore cloud B2B presenta sfide significative, specialmente per aziende con risorse limitate come OnTheCloud. I clienti gestiscono infrastrutture complesse dove anche brevi interruzioni causano perdite economiche, problemi di prestazioni impattano la produttività e vulnerabilità di sicurezza comportano rischi significativi. Questo ambiente richiede supporto continuo e tempi di risposta rapidi.

Per team tecnici ridotti (2-10 persone), le sfide principali includono: impossibilità di garantire copertura 24/7, necessità di competenze diversificate, difficoltà nella gestione della conoscenza, limitata scalabilità con la crescita della clientela e bilanciamento tra supporto reattivo e sviluppo. L'approccio tradizionale di aumentare il personale risulta insostenibile, richiedendo una riprogettazione del modello di supporto.

## 1.4 Vantaggi dell'Automazione tramite AI

L'integrazione dell'intelligenza artificiale nel supporto tecnico offre vantaggi strategici in due aree principali:

### Disponibilità e Standardizzazione
L'AI garantisce supporto continuativo 24/7, gestione simultanea di multiple richieste con risposte rapide e coerenti basate sulle best practice, eliminando la variabilità tra operatori.

### Gestione Intelligente
Il sistema identifica autonomamente quando è necessario l'intervento umano, raccoglie informazioni preliminari, accede efficacemente alla knowledge base e sintetizza informazioni da diverse fonti applicando procedure standard.

L'automazione potenzia il supporto umano anziché sostituirlo, permettendo agli operatori di concentrarsi su problemi complessi, clienti e sviluppo di nuove soluzioni, massimizzando così il valore aggiunto del team tecnico.

## 1.5 Obiettivi del Progetto

Il progetto mira a risolvere le sfide del supporto tecnico attraverso sei obiettivi principali:

1. **Automazione di primo livello**: Sviluppare un sistema basato su GPT-4 (Generative Pre-trained Transformer 4, il modello avanzato di intelligenza artificiale sviluppato da OpenAI) per gestire autonomamente le richieste comuni ed eseguire operazioni tecniche di base.

2. **Riduzione del carico operativo**: Diminuire il tempo dedicato al supporto standard mediante filtri automatici e preparazione preventiva delle informazioni, permettendo al personale tecnico di concentrarsi su attività a maggior valore aggiunto.

3. **Ottimizzazione tempi di risposta**: Garantire risposte immediate (inferiori a 2 secondi nel 95% dei casi) tramite elaborazione asincrona, migliorando significativamente l'esperienza utente rispetto ai tempi di attesa tradizionali.

4. **Standardizzazione**: Assicurare uniformità e coerenza nelle soluzioni proposte seguendo best practice documentate, evitando la variabilità delle risposte tipica dei diversi operatori umani.

5. **Escalation intelligente**: Trasferire fluidamente le richieste complesse agli operatori umani preservando il contesto della conversazione, riconoscendo autonomamente quando un problema supera le capacità del sistema automatizzato.

6. **Integrazione ecosistema**: Sincronizzare il sistema con la piattaforma Konsolex (il sistema operativo cloud proprietario di OnTheCloud) tramite autenticazione unificata e notifiche bidirezionali, creando un'esperienza seamless per l'utente finale.

Questa architettura modulare crea un ecosistema di supporto equilibrato che combina l'automazione dell'intelligenza artificiale con l'intervento umano nei casi più complessi, ottimizzando l'utilizzo delle risorse tecniche disponibili.
