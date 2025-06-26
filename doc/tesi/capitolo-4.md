# Capitolo 4: Scelte Tecnologiche

Questo capitolo presenta le principali scelte tecnologiche adottate nello sviluppo del chatbot AI per il supporto tecnico, con particolare attenzione agli strumenti e framework che hanno permesso l'integrazione tra intelligenza artificiale e sistemi aziendali esistenti.

## 4.1 OpenAI GPT-4: Cuore dell'Intelligenza Conversazionale

La scelta di OpenAI GPT-4 come modello di intelligenza artificiale è stata determinata dalla sua superiore capacità di gestire contenuti tecnici complessi e dalla possibilità di estendere le sue funzionalità attraverso API avanzate.

Come evidenziato nel file `openai-handlers.ts`, l'implementazione sfrutta tre funzionalità chiave dell'API OpenAI:

1. **Function Calling**: Consente al modello di riconoscere quando è necessario eseguire operazioni concrete sulla piattaforma Konsolex.
   ```typescript
   // Esempio dall'implementazione in openai-handlers.ts
   async function handleToolCalls(openai: OpenAI, run: any, threadId: string, runId: string) {
     if (run.required_action?.type === 'submit_tool_outputs') {
       const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
       // Esecuzione di funzioni basate sulla richiesta dell'AI
     }
   }
   ```

2. **Thread Management**: Permette il mantenimento del contesto, in questo modo l'AI di OpenAI conserva l'attenzione della convesazione col client.
   ```typescript
   // Gestione e reset dei thread in openai-handlers.ts
   const thread = await openai.beta.threads.create();
   await userOps.updateThreadByUserId(userId, thread.id);
   ```

3. **Parametrizzazione Avanzata**:
La qualità e coerenza delle risposte dell'assistente AI sono state calibrate attraverso parametri specifici, in particolare temperature e top_p, che influenzano direttamente il processo di generazione del testo:
   ```typescript
   run = await openai.beta.threads.runs.create(
     user.thread_id,
     {
       assistant_id: user.assistant_id,
       tools: openaiTools,
       temperature: 0.1,
       top_p: 1
     }
   );
   ```
L'implementazione adotta deliberatamente un approccio deterministico (temperature: 0.1) che riduce significativamente la casualità nelle risposte generate. Questa configurazione garantisce che:

Le soluzioni tecniche fornite siano altamente coerenti tra interazioni simili
I processi di troubleshooting seguano percorsi prevedibili e standardizzati
Le istruzioni operative fornite rispettino rigorosamente le procedure documentate
Questa scelta strategica risponde alla natura critica del supporto tecnico in ambito cloud enterprise, dove la precisione e l'aderenza ai protocolli stabiliti prevalgono sulla varietà espressiva. I clienti necessitano di risoluzioni tecniche formulate in modo consistente, applicabili a scenari operativi ben definiti e conformi alle best practices del settore.

## 4.2 Stack tecnologico: TypeScript, Node.js, Express

### 4.2.1 TypeScript: Robustezza e Manutenibilità

TypeScript è stato adottato come linguaggio principale per i suoi benefici in termini di:

- **Tipizzazione statica**: Riduzione degli errori runtime attraverso controlli di tipo a compile-time
- **Intellisense e autocompletamento**: Miglioramento della produttività degli sviluppatori
- **Documentazione implicita**: I tipi fungono da documentazione per le API

L'utilizzo di interfacce fortemente tipizzate ha garantito coerenza nelle operazioni su entità come messaggi, utenti e thread:

```typescript
interface SendMessageRequest {
  text: string;
  userId: string;
  tg_id: string;
}
```

### 4.2.2 Node.js ed Express.js

Node.js è stato scelto come runtime per la sua eccellente gestione delle operazioni I/O non bloccanti, cruciale per un sistema di chat reattivo che deve gestire diverse conversazioni simultanee.

Express.js ha fornito un framework leggero ma potente per l'implementazione delle API REST, come evidente nel file `web-server.ts`:

```typescript
app.post(API.SEND_MESSAGE, async (req, res) => {
  const { text, userId, tg_id } = req.body as SendMessageRequest;
  // Gestione della richiesta e generazione risposta
});
```

## 4.3 Database e ORM Sequelize

Per la persistenza dei dati è stato adottato un approccio relazionale gestito attraverso Sequelize ORM, che ha fornito:

1. **Astrazione del database**: Indipendenza dal DBMS specifico sottostante
2. **Modelli tipizzati**: Integrazione naturale con TypeScript
3. **Query builder**: Semplificazione delle operazioni CRUD

I repository come `message-repository.ts` e `user-repository.ts` implementano pattern di accesso ai dati ben strutturati:

```typescript
// Esempio di pattern repository con Sequelize
export async function findByUserId(userId: string): Promise<User | null> {
  return await User.findOne({ where: { user_id: userId } });
}
```

Le entità principali gestite includono:
- **Users**: Profili utente con riferimenti a thread OpenAI
- **Messages**: Conversazioni con tipologia e metadati associati
- **Assistants**: Configurazioni degli assistenti virtuali
- **Score**: Risultati delle risposte in relazione alla domanda posta dal client, implementato per futuri utilizzi.

## 4.4 Integrazione con API esterne

### 4.4.1 Telegram Bot API

L'integrazione con Telegram è stata implementata tramite la libreria Telegraf, fornendo un'interfaccia utente accessibile e familiare. 

Il file `bot.ts` gestisce i comandi e le interazioni, mentre `endpoint.ts` implementa funzionalità come l'invio di notifiche ticket agli amministratori:

```typescript
await bot.telegram.sendMessage(adminUserId, message, {
  reply_markup: inlineKeyboard,
});
```

### 4.4.2 Konsolex API

L'integrazione con la piattaforma Konsolex rappresenta un elemento distintivo del progetto. Il file `endpoint.ts` implementa numerose funzioni che interagiscono con l'API Konsolex:

```typescript
export async function restartServer(userId: string, serverName: string): Promise<boolean> {
  try {
    const server_id = await getServerId(userId, serverName);
    const response = await axios.post(
      KONSOLEX_ENDPOINT.RESTART_SERVER,
      { id: server_id.id },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'userid': userId
        }
      }
    );
    return true;
  } catch (error) {
    console.error("Errore nel riavvio del server:", error);
    return false;
  }
}
```

Le principali categorie di API utilizzate includono:
- **Gestione utenti**: Autenticazione e sincronizzazione profili
- **Operazioni server**: Riavvio, monitoraggio e configurazione
- **Gestione domini**: Verifica disponibilità, configurazione DNS
- **Container management**: Restart e scaling di risorse

La centralizzazione degli endpoint nel file `constants.ts` garantisce consistenza nelle interazioni con le API esterne e semplifica eventuali aggiornamenti futuri.

## 4.5 Considerazioni finali

L'architettura tecnologica adottata bilancia efficacemente innovazione (GPT-4) e solidità (TypeScript, Node.js), creando un sistema capace di gestire richieste tecniche complesse attraverso un'interfaccia conversazionale intuitiva. L'integrazione con i sistemi esistenti di OnTheCloud è stata garantita attraverso API ben documentate e un design modulare che facilita future evoluzioni del sistema.

