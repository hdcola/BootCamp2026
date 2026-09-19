import "dotenv/config";
import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";

const bot = new Bot(process.env.BOT_TOKEN);

bot
  .on("message", async (ctx, next) => {
    console.log(ctx);
    const text = ctx.message?.text;
    const chatId = ctx.message?.chat.id;
    const username = ctx.message?.from?.username ?? "unknown";
    console.log(`@${username} | chat ID: ${chatId} | message: ${text}`);
    await next();
  })

  .on("message", async (ctx) => {
    const text = ctx.message?.text;

    await ctx.reply(text);
  });
await run(bot);
