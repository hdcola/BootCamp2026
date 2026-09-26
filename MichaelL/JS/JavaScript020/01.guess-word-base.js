import "dotenv/config";
import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";

const bot = new Bot(process.env.BOT_TOKEN);
const games = new Map();
const fallback_words = "Apple";

async function WordGenerator() {
  const response = await fetch(
    "https://random-word-api.herokuapp.com/word?number=1",
    {
      method: "GET",
      headers: {
        "User-Agent": "undici-stream-example",
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const data = fallback_words;
    console.log(data);
    return data;
  } else {
    const data = await response.json();
    const word = data[0];
    console.log(data);
    return word;
  }
}

bot
  .command("start", async (ctx) => {
    const word = await WordGenerator();
    const randomIndex = Math.floor(Math.random() * word.length);
    const target_letter = word[randomIndex];
    const text = ctx.message?.text;
    const chatId = ctx.message?.chat.id;
    const username = ctx.message?.from?.username ?? "unknown";

    console.log(`@${username} | chat ID: ${chatId} | message: ${text}`);
    console.log("Word:", target_letter);

    const letterArray = [];

    games.set(chatId, {
      word,
      letters: letterArray,
      attempts: 0,
      isPlaying: true,
    });

    for (let i = 0; i < word.length; i++) {
      if (i === randomIndex) {
        letterArray.push(target_letter);
      } else {
        letterArray.push("_");
      }
    }

    await ctx.reply("Guess a letter or a word! Here is the hint:");
    await ctx.reply(letterArray.join(" "));
  })
  .on("message", async (ctx) => {
    const text = ctx.message?.text;
    const chatId = ctx.message?.chat.id;
    const game = games.get(chatId);
    const guess = text.trim().toLowerCase();
    const word = game.word.toLowerCase();

    if (!game || !game.isPlaying) {
      await ctx.reply("You have not started a game yet. Send /start.");
      return;
    }

    if (guess.length !== 1 && guess !== word) {
      await ctx.reply("Please guess one letter or the entire word.");
      return;
    }

    if (!/^[a-z]+$/.test(guess)) {
      await ctx.reply("Please enter a letter or word using letters only.");
      return;
    }

    if (guess === word) {
      game.isPlaying = false;
      game.attempts = game.attempts + 1;
      await ctx.reply(
        `Correct! The word was "${game.word}".\n` +
          `You guessed ${game.attempts} times.`,
      );

      return;
    }

    if (guess.length === 1 && word.includes(guess)) {
      for (let i = 0; i < word.length; i++) {
        if (word[i] === guess) {
          game.letters[i] = game.word[i];
        }
      }

      await ctx.reply(`Correct! "${guess}" is in the word.`);
      await ctx.reply(game.letters.join(" "));

      var k = 0;
      for (let i = 0; i < word.length; i++) {
        if (game.letters[i] === word[i]) {
          k = k + 1;
        }
      }

      if (k === word.length) {
        await ctx.reply(`Correct! The word was "${game.word}".\n`);
      }
    } else {
      await ctx.reply(`No — "${guess}" is not in the word.`);
    }
    game.attempts = game.attempts + 1;
    await ctx.reply(`Attempts: ${game.attempts}`);
  });

await run(bot);
