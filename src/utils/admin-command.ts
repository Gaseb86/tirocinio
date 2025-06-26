import console from "console";
import { Context, MiddlewareFn } from "telegraf";
import Message from "../../src/entities/Message";
import * as ticketOps from "../utils/ticketsCashe";
import * as userOps from "../repositories/user-repository";
import * as messageOps from "../repositories/message-repository";
import { detectBot } from "../telegram-command-handler";
import { CallbackQuery, TelegramAdminIdArray } from "./constants";
import { setupAdminReplyState, closeTicket, findTicket } from "./ticketsCashe";

export const adminCommand: MiddlewareFn<Context> = async (ctx) => {
  try {
    const tg_id = detectBot(ctx);
    if (!isAdmin(tg_id)) {
      await ctx.reply("You are not authorized to use this command.");
      return;
    }
    await generateMenuKeyboard(ctx);
  } catch (err) {
    console.error(err);
    await ctx.reply("An error occurred.");
  }
};

export const callbackQuery: MiddlewareFn<Context> = async (ctx) => {
  try {
    const adminId = detectBot(ctx);
    if (!ctx.callbackQuery) {
      await ctx.reply("An error occurred: Callback query is invalid.");
      return;
    }
    if (!isAdmin(adminId)) {
      await ctx.reply("You are not authorized.");
      return;
    }
    await ctx.answerCbQuery();
    const callbackData = (ctx.callbackQuery as { data: string }).data;
    // Directly access callbackQuery.data assuming it exists since we checked ctx.callbackQuery above
    const parts = callbackData.split("_");
    const command = parts[0];
    console.log("command: ", command);
    switch (command) {
      case CallbackQuery.showUserList:
        await generateUserListKeyboard(ctx, parseInt(parts[1] || "0"));
        break;

      case CallbackQuery.showTicketsList:
        await generateTicketListKeyboard(ctx, parseInt(parts[1] || "0"));
        break;

      case CallbackQuery.mainMenu:
        await generateMenuKeyboard(ctx, true);
        break;

      case CallbackQuery.showUserMessages:
        const tgIdForMessages = parts[1];
        const pageForMessages = parseInt(parts[2] || "0");
        await showUserMessages(ctx, tgIdForMessages, pageForMessages);
        break;

      case CallbackQuery.viewUserTicket:
        const userIdForTicket = parts[1];
        await showUserTicket(ctx, userIdForTicket);
        break;

      case CallbackQuery.replyToTicket:
        const userIdToReply = parts[1];
        setupAdminReplyState(userIdToReply);
        await ctx.reply("Please enter your reply:");
        break;

      case CallbackQuery.closeTicket:
        const user_id = parts[1];
        const result = await closeTicket(user_id);
        if (result) {
          await ctx.reply("Ticket closed.");
        } else {
          await ctx.reply("Ticket not found.");
        }
        break;

      default:
        console.log(`Unknown command: ${command}`);
        // Optionally, handle unknown command case here, such as sending a message to the user.
        break;
    }
  } catch (err) {}
};

async function showUserMessages(ctx: Context, tg_id: string, page: number) {
  const user = await userOps.findByTelegramId(tg_id);
  if (!user) {
    await ctx.editMessageText("User not found.");
    return;
  }
  const messages = await messageOps.getMessagesByUserId(user.user_id);
  //const messages = await messageOps.getOpenTicketMessagesByUserId(user.user_id);
  if (messages.length === 0) {
    await ctx.editMessageText("No messages found for this user.");
    return;
  }
  const messageChunks = chunkMessages(messages, 10);

  let responseText = messageChunks[page]
    ?.map((msg) => {
      return `*${msg.type}* : ${msg.message}`;
    })
    .join("\n");

  if (responseText === "") {
    responseText = "No more messages.";
  }

  const inlineKeyboard = [];
  if (page > 0) {
    inlineKeyboard.push({
      text: "⬅️ Previous",
      callback_data: `${CallbackQuery.showUserMessages}_${tg_id}_${page - 1}`,
    });
  }
  if (page < messageChunks.length - 1) {
    inlineKeyboard.push({
      text: "Next ➡️",
      callback_data: `${CallbackQuery.showUserMessages}_${tg_id}_${page + 1}`,
    });
  }
  inlineKeyboard.push({
    text: "📋 Show User List",
    callback_data: CallbackQuery.showUserList,
  });
  inlineKeyboard.push({
    text: "🏠 Main Menu",
    callback_data: CallbackQuery.mainMenu,
  });
  await ctx.editMessageText(responseText, {
    reply_markup: { inline_keyboard: [inlineKeyboard] },
    parse_mode: "Markdown",
  });
}

async function showUserTicket(ctx: Context, user_id: string) {
  const ticket = findTicket(user_id);
  if (!ticket) {
    await ctx.reply("ticket not found");
    return;
  }
  const messages = await ticket.getAllMessages();
  if (messages.length === 0) {
    await ctx.reply("No messages found for this ticket.");
  }
  let responseText = `Ticket from ${ticket.username || user_id}:\n\n${messages
    .map((message) => message.message)
    .join("\n")}`;

  const inlineKeyboard = [];

  inlineKeyboard.push({
    text: "📃 Show Tickets List",
    callback_data: CallbackQuery.showTicketsList,
  });
  inlineKeyboard.push({
    text: "🔒 Close Ticket",
    callback_data: `${CallbackQuery.closeTicket}_${user_id}`,
  });
  inlineKeyboard.push({
    text: "✉️ Reply to Ticket",
    callback_data: `${CallbackQuery.replyToTicket}_${user_id}`,
  });
  inlineKeyboard.push({
    text: "🏠 Main Menu",
    callback_data: CallbackQuery.mainMenu,
  });
  await ctx.editMessageText(responseText, {
    reply_markup: { inline_keyboard: [inlineKeyboard] },
    parse_mode: "Markdown",
  });
}

function chunkMessages(messages: Message[], size: number) {
  const chunks = [];
  for (let i = 0; i < messages.length; i += size) {
    chunks.push(messages.slice(i, i + size));
  }
  return chunks;
}

async function generateTicketListKeyboard(
  ctx: Context,
  page: number = 0,
  pageSize: number = 8
) {
  const tickets = ticketOps.getAllOpenTickets();
  if (tickets.length === 0) {
    await ctx.editMessageText("No open tickets.");
    return;
  }

  const start = page * pageSize;
  const end = start + pageSize;
  const pageTickets = tickets.slice(start, end);
  const inlineKeyboard = [];

  for (let i = 0; i < pageTickets.length; i += 2) {
    const ticketPair = pageTickets.slice(i, i + 2).map((ticket) => {
      return {
        text: `Ticket: ${ticket.username || ticket.userId}`,
        callback_data: `${CallbackQuery.viewUserTicket}_${ticket.userId}`,
      };
    });
    inlineKeyboard.push(ticketPair);
  }

  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push({
      text: "⬅️ Previous",
      callback_data: `${CallbackQuery.showTicketsList}_${page - 1}`,
    });
  }

  if (end < tickets.length) {
    navigationButtons.push({
      text: "Next ➡️",
      callback_data: `${CallbackQuery.showTicketsList}_${page + 1}`,
    });
  }

  if (navigationButtons.length > 0) {
    inlineKeyboard.push(navigationButtons);
  }

  await ctx.editMessageText("Select a ticket to view:", {
    reply_markup: { inline_keyboard: inlineKeyboard },
    parse_mode: "Markdown",
  });
}

async function generateUserListKeyboard(
  ctx: Context,
  page: number = 0,
  pageSize: number = 8
) {
  const users = await userOps.fetchAll();
  if (users.length === 0) {
    await ctx.editMessageText("No Users found.");
    return;
  }

  const start = page * pageSize;
  const end = start + pageSize;
  const pageUsers = users.slice(start, end);
  const inlineKeyboard = [];

  for (let i = 0; i < pageUsers.length; i += 2) {
    const userPair = pageUsers.slice(i, i + 2).map((user) => {
      return {
        text: `User: ${user.username || user.telegram_id}`,
        callback_data: `${CallbackQuery.showUserMessages}_${user.telegram_id}`,
      };
    });
    inlineKeyboard.push(userPair);
  }

  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push({
      text: "⬅️ Previous",
      callback_data: `${CallbackQuery.showUserList}_${page - 1}`,
    });
  }

  if (end < users.length) {
    navigationButtons.push({
      text: "Next ➡️",
      callback_data: `${CallbackQuery.showUserList}_${page + 1}`,
    });
  }

  navigationButtons.push({
    text: "🏠 Main Menu",
    callback_data: `${CallbackQuery.mainMenu}`,
  });

  if (navigationButtons.length > 0) {
    inlineKeyboard.push(navigationButtons);
  }

  // Fallback to sending a new message if we're not in a context where we can edit
  await ctx.editMessageText("Select a user to view messages:", {
    reply_markup: { inline_keyboard: inlineKeyboard },
    parse_mode: "Markdown",
  });
}

async function generateMenuKeyboard(ctx: Context, callBack: boolean = false) {
  const inlineKeyboard = [
    [{ text: "📋 Show User List", callback_data: CallbackQuery.showUserList }],
    [
      {
        text: "📃 Show Open Tickets",
        callback_data: CallbackQuery.showTicketsList,
      },
    ],
  ];
  if (!callBack) {
    return await ctx.reply("Select an option:", {
      reply_markup: { inline_keyboard: inlineKeyboard },
    });
  }
  await ctx.editMessageText("Select an option:", {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
}

export function isAdmin(tg_id: number): boolean {
  return TelegramAdminIdArray.includes(tg_id);
}
