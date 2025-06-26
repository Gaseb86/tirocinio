import { OpenAI } from "openai";
import * as userOps from "../repositories/user-repository";
import * as scoreOps from "../repositories/score-repository";
import {
  getDomainList,
  getServerList,
  checkDomainAvailability,
  getAuthInfo,
  sendMessageToAdmin,
  restartServer,
  powerOnServer,
  restartMysqlOrPostfix,
  modifyRdns,
  ramCpuMemoryImprove,
  restartContainer,
  updateAuthinfo,
  modifyDns,
  addDns,
  addDomain,
  getServerId,
  getSiteList
} from "./endpoint";
import User from "../entities/User";
import { OPENAI_ASSISTANT_ID_PAOLO, OPENAI_ASSISTANT_ID_ROBERTO, OPENAI_ASSISTANT_ID_ANDREA, KONSOLEX_ENDPOINT } from "../utils/constants";
import Message from "../entities/Message";
import { checkRelevance, getAllRunSteps, openaiTools } from "./openai-tool";

// Assistant interface
interface Assistant {
  id: string;
  tools: Array<{
    type: string;
    [key: string]: any;
  }>;
  file_ids?: string[];
}

export async function updateUserThreadAndAssistant(openai: OpenAI, user: User): Promise<User> {
  const lastTimeUsed = user.last_time_used;
  const currentTime = new Date();
  const timeDifference = (currentTime.getTime() - new Date(lastTimeUsed).getTime()) / 1000 / 60 / 60; // in hours

  // test user for debugging
  if (user.user_id === "d821f138-0303-4a4a-aa77-9f70224a1e37" && timeDifference > 0.03) {
    console.log("SONO ITALIA PISTONI")
    const thread = await openai.beta.threads.create();
    await userOps.updateThreadByUserId(user.user_id, thread.id);
    user.thread_id = thread.id;
  }

  if (timeDifference > 4 && user.user_id !== "d821f138-0303-4a4a-aa77-9f70224a1e37") {
    const thread = await openai.beta.threads.create();
    await userOps.updateThreadByUserId(user.user_id, thread.id);
    user.thread_id = thread.id;
    /*
    const randAssistantId = getRandomAssistant();
    if (user.assistant_id !== randAssistantId) {
      await userOps.updateAssistantByUserId(user.user_id, OPENAI_ASSISTANT_ID_PAOLO);
      user.assistant_id = OPENAI_ASSISTANT_ID_PAOLO;
    }
      */
  }
  await userOps.updateLastTimeUsedByUserId(user.user_id);
  return user;
}

function getRandomAssistant(): string {
  const assistants = [
    OPENAI_ASSISTANT_ID_PAOLO,
    OPENAI_ASSISTANT_ID_ROBERTO,
    OPENAI_ASSISTANT_ID_ANDREA
  ];
  if (assistants.some(id => !id)) {
    throw new Error('Missing assistant ID configuration');
  }
  return assistants[Math.floor(Math.random() * assistants.length)];
}


export async function createReply(
  openai: OpenAI,
  user: User,
  userMsg: Message
): Promise<string> {
  try {
    // Add message to thread
    await openai.beta.threads.messages.create(
      user.thread_id,
      {
        role: "user",
        content: userMsg.message,
      }
    );
    // Create run NUOVO TEST
    let run: OpenAI.Beta.Threads.Runs.Run & {
      _request_id?: string | null;
    };

    //!if (user.user_id === "d821f138-0303-4a4a-aa77-9f70224a1e37") {}
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
    console.log("Run created:", run.id);

    // Wait for assistant to complete processing
    await waitForResponse(openai, user.user_id, user.thread_id, run.id, userMsg);
    // Attendi che il run sia completato
    await new Promise(resolve => setTimeout(resolve, 2000));

    const toolCallStep = await getAllRunSteps(openai, user.thread_id, run.id);
    const response = await getAssistantResponse(openai, user.thread_id);
    if (toolCallStep) {
      const score = await checkRelevance(toolCallStep);
      if (score !== null) {
        // crea messaggio nella tabella score
        const msg = await scoreOps.create(userMsg.message, response, score);
      }
    } else {
      console.log('No tool call steps found in the run');
    }
    return response;
  }
  catch (error) {
    console.error("Error in createReply:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_RESPONSE":
          return "Mi dispiace, la risposta non è valida, puoi riprovare.";

        case "TIMEOUT":
          // Thread already reset in waitForResponse
          return "Mi dispiace, ci ho messo troppo tempo a rispondere. Ho resettato la conversazione, ora puoi riprovare.";

        default:
          // Generic error - create new thread just in case
          return "Si è verificato un errore imprevisto, puoi riprovare.";
      }
    }
    return "Si è verificato un errore imprevisto. Riprova più tardi.";
  }
}

// Get response with proper error handling and message validation
async function getAssistantResponse(
  openai: OpenAI,
  threadId: string
): Promise<string> {

  // Get latest messages
  const messages = await openai.beta.threads.messages.list(threadId);

  // Validate we have messages
  if (!messages.data || messages.data.length === 0) {
    throw new Error("INVALID_RESPONSE");
  }

  // Get latest message content
  const lastMessage = messages.data[0];
  if (!lastMessage.content || lastMessage.content.length === 0) {
    throw new Error("INVALID_RESPONSE");
  }

  // Validate content type and value
  const textContent = lastMessage.content[0];
  if (textContent.type !== 'text' || !textContent.text?.value) {
    throw new Error("INVALID_RESPONSE");
  }

  return textContent.text.value;
}

async function waitForResponse(
  openai: OpenAI,
  userId: string,
  threadId: string,
  runId: string,
  msg: Message
): Promise<any> {
  const MAX_RETRIES = 50;
  const POLLING_INTERVAL = 2000;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    // Add detailed logging
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

    if (run.status === 'completed') {
      console.log('Run completed successfully:', runId);
      return run;
    }

    if (run.status === 'failed' || run.status === 'expired' || run.status === 'cancelled') {
      console.error('Run failed with status:', run.status, 'Error:', run.last_error);
      const newThread = await openai.beta.threads.create();
      await userOps.updateThreadByUserId(userId, newThread.id);
      throw new Error("INVALID_RESPONSE");
    }

    if (run.status === 'requires_action') {
      console.log('Run requires action:', run.required_action);
      await handleToolCalls(openai, run, threadId, runId, userId, msg);
      continue;
    }

    if (attempts >= MAX_RETRIES - 1) {
      console.error('Run timed out after', MAX_RETRIES, 'attempts');
      const newThread = await openai.beta.threads.create();
      await userOps.updateThreadByUserId(userId, newThread.id);
      throw new Error("TIMEOUT");
    }

    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    attempts++;
  }
}

async function handleToolCalls(openai: OpenAI, run: any, threadId: string, runId: string, userId: string, msg: Message) {
  if (run.required_action?.type === 'submit_tool_outputs') {
    const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
    const toolOutputs: { tool_call_id: string; output: string }[] = [];

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      // Call the appropriate function based on the tool name
      let functionResult;
      console.log('Function name:', functionName, 'Arguments:', functionArgs);

      try {
        // Esegui la funzione e assicurati che il risultato sia definito
        functionResult = await executeTool(functionName, functionArgs, userId, msg.id!);

        // Se il risultato è undefined o null, fornisci un risultato di fallback
        if (functionResult === undefined || functionResult === null) {
          functionResult = {
            error: true,
            message: `La funzione ${functionName} non ha prodotto alcun risultato`
          };
        }

        // Assicurati che il risultato sia una stringa JSON valida
        const outputString = typeof functionResult === 'string'
          ? functionResult
          : JSON.stringify(functionResult);

        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: outputString
        });

      } catch (error) {
        console.error(`Error executing ${functionName}:`, error);
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify({
            error: true,
            message: `Errore nell'esecuzione di ${functionName}`
          })
        });
      }
    }

    // Submit tool outputs
    if (toolOutputs.length > 0) {
      await openai.beta.threads.runs.submitToolOutputs(
        threadId,
        runId,
        { tool_outputs: toolOutputs }
      );
    }
  }
}

// Funzione helper per eseguire gli strumenti
async function executeTool(functionName: string, args: any, userId: string, msgId: number): Promise<any> {
  switch (functionName) {
    case 'getDomainList': //ok
      return await getDomainList(
        userId
      );
    case 'getServerList': //ok
      return await getServerList(
        userId
      );
    case 'getSiteList':
      return await getSiteList(
        userId
      );
    case 'checkDomainAvailability': //ok ma il messaggio è strano
      return await checkDomainAvailability(
        args.domain,
        userId
      );
    case 'getAuthInfo': // manca il domain id da recuperare
      return await getAuthInfo(
        args.domain,
        userId
      );
    case 'openTicket': //ok
      return await sendMessageToAdmin(
        args.TicketMessage,
        { userId },
        msgId
      );
    case 'restartServer': //ok
      return await restartServer(
        userId,
        args.serverName
      );
    case 'restartMysql': //ok
      return await restartMysqlOrPostfix(
        userId,
        args.serverName,
        "mysql"
      );
    case 'restartPostfix': //ok
      return await restartMysqlOrPostfix(
        userId,
        args.serverName,
        "postfix"
      );
    case 'modifyRdns':
      return await modifyRdns(
        userId,
        args.id,
        args.ip,
        args.dns_ptr
      );
    case 'siteWebRamCpuMemoryImprove': // aggiungere "m" a memori dopo il valore
      return await ramCpuMemoryImprove(
        userId,
        args.siteName,
        args.cpu,
        args.memory,
        "site"
      );
    case 'siteDbRamCpuMemoryImprove': //da testare con db
      return await ramCpuMemoryImprove(
        userId,
        args.siteName,
        args.cpu,
        args.memory,
        "db"
      );
    case 'restartWebContainer': //ok
      return await restartContainer(
        userId,
        args.siteName,
        "site"
      );
    case 'restartDbContainer': //da testare con db
      return await restartContainer(
        userId,
        args.siteName,
        "db"
      );
    case 'updateAuthinfo':
      return await updateAuthinfo(
        userId,
        args.domainName
      );
    
    // ... altri case per le altre funzioni ...

    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}