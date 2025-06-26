import * as msgOps from "../repositories/message-repository";
import * as userOps from "../repositories/user-repository";
import User from "../entities/User";
import { KONSOLEX_ENDPOINT, OPENAI_ASSISTANT_ID_PAOLO, TelegramAdminIdArray } from "./constants";
import Message, { MessageType } from "../entities/Message";
import { OpenAI } from "openai";
import * as openaiOps from "./openai-handlers";
import axios from "axios";
import { bot } from "../index";


export async function storeMessageAndCreateReply(
  openai: OpenAI,
  user: User,
  userMsg: Message,
): Promise<string> {

  const timestamp = Math.floor(Date.now() / 1000);
  
  // Get GPT reply
  const gptReply = await openaiOps.createReply(
    openai,
    user,
    userMsg
  );
  if (gptReply === "Mi dispiace, ci ho messo troppo tempo a rispondere. Ho resettato la conversazione, ora puoi riprovare.") {
    // update user
    const userUpdated = await userOps.findByUserId(user.user_id);
    // Create GPT message in db
    await createGptMessage(userUpdated!, gptReply, timestamp);
  }
  else {
    console.log("GPT Reply: ", gptReply);
    const reformattedGptReply = formatGPTResponse(gptReply);
    console.log("Reformatted GPT Reply: ", reformattedGptReply);
    await createGptMessage(user, reformattedGptReply, timestamp);
  }

  // Update GTP message on Konsolex interface
  axios.post(
    KONSOLEX_ENDPOINT.MESSAGES_UPDATE,
    {
      updated: true,
      userid: user.user_id
    }
  );
  return gptReply;
}

export async function createUserMessage(user: User, text: string, timestamp: number) {
  const msg = await msgOps.create(
    user.user_id,
    user.assistant_id,
    user.thread_id,
    text,
    timestamp,
    MessageType.User
  );
  if (!msg) throw new Error("Failed to save user message");
  return msg;
}

export async function createGptMessage(user: User, text: string, timestamp: number) {
  const msg = await msgOps.create(
    user.user_id,
    user.assistant_id,
    user.thread_id,
    text,
    timestamp,
    MessageType.GPT);
  if (!msg) throw new Error("Failed to save GPT message");
  return msg;
}

export async function createMessage(
  user: User,
  text: string,
  type: MessageType,
  ticketOpen?: boolean,
  ticketId?: number
): Promise<Message> {
  const timestamp = Math.floor(Date.now() / 1000);
  const msg = await msgOps.create(
    user.user_id,
    user.assistant_id,
    user.thread_id,
    text,
    timestamp,
    type,
    ticketOpen,
    ticketId
  );

  if (!msg) throw new Error(`Failed to save ${type} message`);
  return msg;
};

export async function getUserOrCreate(openai: OpenAI, tg_id: string, userId: string): Promise<User> {
  let user = await userOps.findByTelegramId(tg_id);
  if (user) {
    if (!user.username) {
      const response = await axios.get(KONSOLEX_ENDPOINT.INFO_USER, {
        headers: {
          "userid": userId
        }
      });
      const userInfo = response.data;
      const userName = userInfo.firstname + " " + userInfo.lastname;
      await userOps.updateUsernameByUserId(user.user_id, userName);
    }
    user = await openaiOps.updateUserThreadAndAssistant(openai, user)
    return user;
  }
  const thread = await openai.beta.threads.create();

  // Use end point to get user name
  const response = await axios.get(KONSOLEX_ENDPOINT.INFO_USER, {
    headers: {
      "userid": userId
    }
  });

  const userInfo = response.data;
  const userName = userInfo.firstname + " " + userInfo.lastname;


  return await userOps.create(
    userId,
    thread.id,
    OPENAI_ASSISTANT_ID_PAOLO,
    tg_id,
    userName
  );
}

export async function sendAdminReplyToUser(telegramId: number | string, AdminMsg: string) {
  try {
    AdminMsg = `*Admin Message*: ${AdminMsg}`;
    await bot.telegram.sendMessage(telegramId, AdminMsg, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error("Error sending message:", err);
    throw err;
  }
}

function formatGPTResponse(text: string): string {
  
  // Rimuovi il pattern 【qualsiasi contenuto】
  text = text.replace(/【[^】]*】/g, '');
  // Replace **text** with <bold>text</bold>
  text = text.replace(/\*\*(.*?)\*\*/g, '<bold>$1</bold>');
  // Replace numbers 1-9 followed by period with line breaks
  text = text.replace(/([1-9]\.)/g, '<br>$1');
  // Replace line breaks with <br>
  text = text.replace(/\n/g, '<br>');
  // Remove multiple consecutive <br> tags, keeping maximum two
  text = text.replace(/<br>(\s*<br>)+/g, '<br><br>');
  
  const punctuation = ['.', ':', ';', '?', '!'];
  
  return text.trim();
}
