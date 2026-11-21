import "dotenv/config";
import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";

const bot = new Bot(process.env.BOT_TOKEN);
const games = new Map();
// const fallback_number = "1357";

// // async function WordGenerator() {
// //   const response = await fetch(
// //     "https://random-word-api.herokuapp.com/word?number=1",
// //     {
// //       method: "GET",
// //       headers: {
// //         "User-Agent": "undici-stream-example",
// //         "Content-Type": "application/json",
// //       },
// //     },
// //   );

// //   if (!response.ok) {
// //     const data = fallback_words;
// //     console.log(data);
// //     return data;
// //   } else {
// //     const data = await response.json();
// //     const word = data[0];
// //     console.log(data);
// //     return word;
// //   }
// // }

function generateSecret() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join(
    "",
  );
}

function checkExactMatches(secret, guess) {
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (secret[i] === guess[i]) count++;
  }
  return count;
}
bot
  .command("start", async (ctx) => {
    const number = generateSecret();

    const text = ctx.message?.text;
    const chatId = ctx.message?.chat.id;
    const username = ctx.message?.from?.username ?? "unknown";

    console.log(`@${username} | chat ID: ${chatId} | message: ${text}`);
    console.log("Number:", number);

    games.set(chatId, {
      number,
      attempts: 0,
      isPlaying: true,
    });

    await ctx.reply("Guess a 4 digits number:");
    await ctx.reply(
      "Please do not type any symbols, letter or random stuff >--<",
    );
  })
  .on("message", async (ctx) => {
    const text = ctx.message?.text;
    const chatId = ctx.message?.chat.id;
    const game = games.get(chatId);
    const guess = text.trim();
    const number = game.number;

    if (!game || !game.isPlaying) {
      await ctx.reply("You have not started a game yet. Send /start.");
      return;
    }

    if (guess.length !== 4) {
      await ctx.reply("Please guess a 4 digit number");
      return;
    }

    if (!/^[0-9]+$/.test(guess)) {
      await ctx.reply("Please enter a 4 digit number with digit only.");
      return;
    }

    if (checkExactMatches(number, guess) != 4) {
      await ctx.reply(`You got ${checkExactMatches(number, guess)} correct`);
    }

    if (checkExactMatches(number, guess) == 4) {
      await ctx.reply(`You got it, the number is ${number} `);
    }

    game.attempts = game.attempts + 1;
    await ctx.reply(`Attempts: ${game.attempts}`);
  });

await run(bot);
