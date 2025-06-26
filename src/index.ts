import { Telegraf } from "telegraf";
import { OpenAI } from "openai";
import "reflect-metadata";
import startWebServer from "./web-server";
import config from "./utils/environment";
import setupBot from "./bot";
import { initializeTicketCache } from "./utils/ticketsCashe";


export const bot = new Telegraf(config.telegramKey);

export const openai = new OpenAI({
  apiKey: config.openaiApiKey,
  organization: config.openaiOrgKey
});

const launchApp = async () => {
  console.log("Launching app...");
  // Initialize ticket cache
  await initializeTicketCache();
  // Launch app
  await setupBot(bot, openai);
  // Start the web server
  startWebServer();
  // Launch the bot
  await bot.launch();
  console.log("App launched successfully!");
};

launchApp();