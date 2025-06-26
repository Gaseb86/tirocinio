import OpenAI from "openai";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { BotCommand, BOT_MESSAGE_TYPE } from "./utils/constants";
import * as handler from "./telegram-command-handler";
import * as adminHandler from "./utils/admin-command";

const setupBot = async (bot: Telegraf, openai: OpenAI) => {
  bot.command(BotCommand.Start, handler.startCommand(openai));
  bot.command(BotCommand.Help, handler.helpCommand);
  bot.command(BotCommand.Admin, adminHandler.adminCommand);
  bot.on(message(BOT_MESSAGE_TYPE), handler.handleIncomingTelegramMessage(openai));
  bot.on("callback_query", adminHandler.callbackQuery);
};

export default setupBot;