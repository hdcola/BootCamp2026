import "dotenv/config";
import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";

const bot = new Bot(process.env.BOT_TOKEN);
const games = new Map();

bot
  .command("start", async (ctx) => {
    const target = Math.floor(Math.random() * 101);
    const text = ctx.message?.text;
    const chatId = ctx.message?.chat.id;
    const username = ctx.message?.from?.username ?? "unknown";

    console.log(`@${username} | chat ID: ${chatId} | message: ${text}`);
    console.log("Number:", target);

    games.set(chatId, {
      target,
      attempts: 0,
      isPlaying: true,
    });

    await ctx.reply("Guess a number between 0 and 100");
  })
  .on("message", async (ctx) => {
    const text = ctx.message?.text;
    const chatId = ctx.message?.chat.id;
    const game = games.get(chatId);
    let guess = Number(text);

    if (isNaN(guess)) {
      await ctx.reply("Please enter a number.");
      return;
    } else if (guess > 100 || guess < 0) {
      await ctx.reply("Please enter a number between 0 to 100");
    } else if (!game || !game.isPlaying) {
      await ctx.reply("You have not started a game yet. Send /start.");
      return;
    } else {
      while (text != game.target) {
        if (guess < game.target) {
          await ctx.reply("Too small");
          game.attempts = game.attempts + 1;
          await ctx.reply(`You have tried: ${game.attempts}`);
          return;
        } else {
          await ctx.reply("Too big");
          game.attempts = game.attempts + 1;
          await ctx.reply(`You have tried: ${game.attempts}`);
          return;
        }
      }

      await ctx.reply("you are right!");
      await ctx.reply(`You have tried: ${game.attempts} in total.`);

      game.isPlaying = false;
    }
  });
await run(bot);
