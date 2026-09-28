import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";
import "dotenv/config";
import { messages } from "./message.js";
import {
  games,
  getGameId,
  getGame,
  resetGame,
  compareGuess,
  isValidGuess,
} from "./lib.js";

const bot = new Bot(process.env.BOT_TOKEN);

// command: /start
bot.command("start", async (ctx) => {
  resetGame(ctx);

  await ctx.reply(messages.welcomeMsg, {
    parse_mode: "HTML",
  });
});

// command: /new
bot.command("new", async (ctx) => {
  resetGame(ctx);

  await ctx.reply(messages.newGameMsg);
});

bot.on("message", async (ctx) => {
  if (!ctx.message.text) {
    return;
  }

  const guess = ctx.message.text.trim();

  // 忽略 Telegram command
  if (guess.startsWith("/")) {
    return;
  }

  if (!isValidGuess(guess)) {
    await ctx.reply(messages.invalidGuessMsg);
    return;
  }

  // 获得这个用户自己的游戏
  const game = getGame(ctx);

  game.guessCount++;

  game.history.push(guess);

  const { correctPosition } = compareGuess(guess, game.password);

  console.log("password:", game.password);

  if (correctPosition === 4) {
    await ctx.reply(messages.winMsg(game), {
      parse_mode: "HTML",
    });

    // 游戏结束后删除
    games.delete(getGameId(ctx));

    return;
  }

  await ctx.reply(
    messages.guessResultMsg({
      guess,
      correctPosition,
      guessCount: game.guessCount,
    }),
  );
});

await run(bot);
