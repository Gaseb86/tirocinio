import { Context, Middleware } from "telegraf";
import { OpenAI } from "openai";
import axios from "axios";
import { bot } from "./index";

import * as userOps from "./repositories/user-repository";
import * as messageOps from "./repositories/message-repository";
import * as errorOps from "./repositories/error-repository";

import User from "./entities/User";
import Message, { MessageType } from "./entities/Message";
import ErrorLog, { ErrorType } from "./entities/ErrorLog";

import * as openaiOps from "./utils/openai-handlers";
import { isAdmin } from "./utils/admin-command";
import * as aux from "./utils/aux-functions";
import { createUserMessage } from "./utils/aux-functions";
import { checkUserIdExists, sendMessageToAdmin } from "./utils/endpoint";
import { KONSOLEX_ENDPOINT, OPENAI_ASSISTANT_ID_PAOLO } from "./utils/constants";
import {
  checkClientReplyState,
  findActiveAdminReplyingTicket,
  findTicket,
  resetAdminReplyState,
  resetClientReplyState,
  setupClientReplyState,
} from "./utils/ticketsCashe";

/**
 * Handles errors in command execution.
 * @param {Context} ctx - Telegraf context.
 * @param {ErrorLog} errorLog - ErrorLog instance containing error details.
 * @return {Promise<void>}
 */
export const commandError = async (
  ctx: any,
  errorLog: ErrorLog
): Promise<void> => {
  await errorOps.create(errorLog);
  console.error(
    `Error in ${errorLog.stack_trace} \n error message: ${errorLog.error_message}`
  );
  if (errorLog.error_type === ErrorType.OpenAI) {
    await ctx.reply(
      `Oops! OpenAI API is not available right now. Please try again later.`
    );
  } else {
    await ctx.reply("Oops! Something went wrong. Please try again later.");
  }
  return;
};

/**
 * Handles context-related errors.
 * @param {Context} ctx - Telegraf context.
 * @param {any} error - Optional error object.
 * @return {Promise<any>} Promise resolved.
 */
export const contextError = async (ctx: any, error?: any): Promise<void> => {
  if (error) {
    console.error(error);
  }
  await ctx.reply("Oops! Something went wrong. Please try again later.");
  return;
};

/**
 * Telegraf command handler for the /start command.
 * @param {OpenAI} openai - OpenAI instance.
 * @returns {Middleware<Context>} - Telegraf command handler middleware.
 */
export function startCommand(openai: OpenAI): Middleware<Context> {
  console.log('TEST2')
  return async (ctx: Context) => {
    console.log('TEST3')
    try {
      let user_id;
      const tg_id = detectBot(ctx).toString();
      const name = ctx.from?.first_name || ctx.from?.last_name || "User";
      let message;
      if ("payload" in ctx && ctx.payload) {
        user_id = ctx.payload.toString();
        if (!(await checkUserIdExists(user_id))) {
          await ctx.reply(
            "User id not found in database, please register first on the website"
          );
          return;
        }
        message = await registerUserIfNecessary(
          openai,
          user_id,
          tg_id,
          name,
          ctx.from?.username
        );
      } else {
        message = await validateAccessAndWelcomeUser(tg_id, name);
      }
      await ctx.replyWithMarkdownV2(escapeMarkdown(message));
    } catch (error) {
      if (error instanceof ErrorLog) {
        error.stack_trace = error.stack_trace + "->" + startCommand.name;
        await commandError(ctx, error);
      } else {
        await contextError(ctx, error);
      }
    }
  };
}

/**
 * Telegraf command handler for the /help command.
 * @param {Context} ctx - Telegraf context.
 */
export const helpCommand = async (ctx: Context) => {
  try {
    detectBot(ctx);
    await ctx.replyWithMarkdownV2(
      `This bot is Designed for *CloudOnTheCloud* Company by @SepehrSanchez \nThe goal is to respond to Clients using ChatGPT`
    );
  }
  catch (error) {
    if (error instanceof ErrorLog) {
      error.stack_trace = helpCommand.name;
      await commandError(ctx, error);
    }
    else {
      await contextError(ctx, error);
    }
  }
};

/**
 * Telegraf message handler for text messages.
 * @param {OpenAI} openai - OpenAI instance.
 * @returns {Middleware<Context>} - Telegraf command handler middleware.
 */
export function handleIncomingTelegramMessage(openai: OpenAI): Middleware<any> {
  return async (ctx: any) => {
    try {
      const tg_id = detectBot(ctx);
      let user = await userOps.findByTelegramId(tg_id.toString());

      if (!user) {
        await handleUnregisteredUser(ctx);
        return;
      }
      if (!user.username) {
        const response = await axios.get(KONSOLEX_ENDPOINT.INFO_USER, {
          headers: {
            "userid": user.user_id
          }
        });
        const userInfo = response.data;
        const userName = userInfo.firstname + " " + userInfo.lastname;
        await userOps.updateUsernameByUserId(user.user_id, userName);
      }
      await updateUsernameIfNeeded(ctx, user);
      const admin = isAdmin(tg_id);
      const msgText = ctx.message?.text;
      if (!msgText) {
        await ctx.reply("Please send a text message.");
        return;
      }
      const ticket = findActiveAdminReplyingTicket();
      if (admin && ticket) {
        await handleAdminReply(ctx, msgText, ticket);
        return;
      }
      else if (findTicket(user.user_id)) {
        await handleClientReply(ctx, msgText, tg_id, user);
        return;
      }
      await handleNormalMode(ctx, openai, msgText, user);
    }
    catch (error) {
      if (error instanceof ErrorLog) {
        error.stack_trace = error.stack_trace + "->" + handleIncomingTelegramMessage.name;
        await commandError(ctx, error);
      }
      else {
        await contextError(ctx, error);
      }
    }
  }
}

// Auxiliary functions for handleIncomingTelegramMessage
// -----------------------------------------------------

/**
 * Handles the case where the user is not registered.
 * @param {Context} ctx - Telegraf context.
 * @return {Promise<void>} - Promise resolved.
 */
async function handleUnregisteredUser(ctx: any) {
  await ctx.replyWithMarkdownV2(
    "⚠️*Access denied*⚠️\n" +
    "Your Telegram account isn't registered with our bot\n" +
    "Please register on our website or use a registered account"
  );
}

/**
 * Updates the username of the user if it has changed.
 * @param {Context} ctx - Telegraf context.
 * @param user - User object.
 * @return {Promise<void>} - Promise resolved.
 */
async function updateUsernameIfNeeded(ctx: any, user: any) {
  if (ctx.from.username && user.username !== ctx.from.username) {
    await userOps.updateUsernameByUserId(user.user_id, ctx.from.username);
  }
}

/**
 * Handles the case where an admin is replying to a user.
 * @param {Context} ctx - Telegraf context.
 * @param {string} msgText - Message text.
 * @param {any} ticket - Ticket object.
 * @returns {Promise<void>} - Promise resolved.
 */
async function handleAdminReply(ctx: any, msgText: string, ticket: any) {
  const userToReply = await userOps.findByUserId(ticket.userId);

  if (!userToReply || !userToReply.telegram_id) {
    await ctx.reply("User was not found in the database");
    return;
  }

  const lastTicket = await Message.findOne({
    where: {
      user_id: userToReply.user_id,
      type: MessageType.Ticket,
    },
    order: [["id", "DESC"]],
    limit: 1,
  });

  console.log(lastTicket?.dataValues);
  await messageOps.create(
    userToReply.user_id,
    userToReply.assistant_id,
    userToReply.thread_id,
    msgText,
    ctx.message.date,
    MessageType.Admin,
    true,
    lastTicket?.id
  );
  await aux.sendAdminReplyToUser(parseInt(userToReply.telegram_id), msgText);
  await ctx.reply("Your reply has been sent.");
  resetAdminReplyState(userToReply.user_id);
  setupClientReplyState(userToReply.user_id);

  axios.post(
    KONSOLEX_ENDPOINT.MESSAGES_UPDATE,
    {
      updated: true,
      userid: userToReply.user_id,
      chat_id: lastTicket?.id
    }
  );
}
/**
 * Handles the case where the user is replying to an admin.
 * @param {Context} ctx - Telegraf context.
 * @param {string} msgText - Message text.
 * @param {number} tg_id - Telegram ID.
 * @param {any} user - User object.
 * @returns {Promise<void>} - Promise resolved.
 */
async function handleClientReply(ctx: any, msgText: string, tg_id: number, user: User) {
  userOps.updateLastTimeUsedByUserId(user.user_id);

  const ticket = await Message.findOne({
    where: {
      user_id: user.user_id,
      type: MessageType.Ticket,
    },
    order: [["id", "DESC"]],
    limit: 1,
  });

  const msg = await messageOps.create(
    user.user_id,
    user.assistant_id,
    user.thread_id,
    msgText,
    ctx.message.date,
    MessageType.User,
    true,
    ticket?.id
  );

  if (msg) {
    const result = await sendMessageToAdmin(
      msgText,
      { userId: user.user_id.toString() },
      msg.id!
    );
    resetClientReplyState(user.user_id);
    await ctx.reply(result);
  }
}
/**
 * Handles the normal mode of the bot.
 * @param {Context} ctx - Telegraf context.
 * @param {OpenAI} openai - OpenAI instance.
 * @param {string} userMsg - Client message.
 * @param {any} user - User object.
 * @returns {Promise<void>} - Promise resolved.
 */
async function handleNormalMode(ctx: any, openai: OpenAI, userMsg: string, user: User) {
  user = await openaiOps.updateUserThreadAndAssistant(openai, user);
  const timestamp = Math.floor(Date.now() / 1000);
  // Create user message in db
  const userMessage = await createUserMessage(user, userMsg, timestamp);
  // Store user message and create GPT reply
  const gptReply = await aux.storeMessageAndCreateReply(openai, user, userMessage);

  if (gptReply) {
    await ctx.replyWithMarkdownV2(escapeMarkdown(gptReply));
  }
  else {
    let errorLog = await ErrorLog.create({
      stack_trace: "message",
      error_message: "GPT response is empty",
      error_type: ErrorType.OpenAI,
      error_datetime: new Date(),
    });
    await commandError(ctx, errorLog);
  }

}

/**
 * Escapes Markdown characters in a text.
 * @param {string} text - Input text.
 * @returns {string} - Escaped text.
 */
const escapeMarkdown = (text: string): string => {
  return text.replace(/[!._[\]()~>#+=|{}-]/g, (match: string) => `\\${match}`);
};

/**
 * Detects if the user associated with the provided context is a bot.
 * If the user is detected as a bot, sends a reply indicating the bot policy.
 * @param {Context} ctx - Telegraf context.
 * @returns {number} - User ID if the user is not a bot.
 */
export const detectBot = (ctx: Context): number => {
  if (!ctx.from) {
    throw new Error("No 'from' field available in the context.");
  } else if (ctx.from.is_bot) {
    throw new Error("Bots are not allowed to interact with this command.");
  }
  return ctx.from.id;
};

async function registerUserIfNecessary(
  openai: OpenAI,
  user_id: string,
  tg_id: string,
  name: string | undefined,
  username: string | undefined
): Promise<string> {
  const user = await userOps.findByUserId(user_id);
  if (user) {
    if (username) {
      await userOps.updateUsernameByUserId(user_id, username);
    }
    await userOps.setTelegramIdByUserId(user_id, tg_id);
    return `Dear ${name}\n Welcome back to your bot! 🚀`;
  }

  const thread = await openai.beta.threads.create();
  await userOps.create(
    user_id.toString(),
    thread.id,
    OPENAI_ASSISTANT_ID_PAOLO,
    tg_id,
    username
  );
  return `Dear ${name},\nYour Telegram account registered successfully ✅`;
}

async function validateAccessAndWelcomeUser(
  tg_id: string,
  name: string | undefined
): Promise<string> {
  const user = await userOps.findByTelegramId(tg_id);
  if (!user) {
    return (
      "⚠️*Access denied*⚠️\nYour Telegram account isn't registered with our bot." +
      "\nPlease register on our website or use a registered account."
    );
  }
  return `Dear ${name}\n Welcome to your bot! 🚀`;
}
