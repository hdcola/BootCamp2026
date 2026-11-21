import "dotenv/config";
import {
  ReplyKeyboardBuilder,
  InlineKeyboardBuilder,
} from "node-telegram-bot-api";
import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";

const bot = new Bot(process.env.BOT_TOKEN);

const games = new Map();
const fallback_words = "Apple";
const userDialogStates = new Map();
const userSettings = new Map();

async function registerCommands() {
  await bot.api.setMyCommands({
    commands: [
      { command: "start_game", description: "start the game" },
      {
        command: "settings",
        description: "length of the word and hardness level",
      },
    ],
  });
}

await registerCommands();

const wordlength_keyboard_1 = new InlineKeyboardBuilder(2)
  .text("4", "length_4")
  .text("5", "length_5")
  .text("6", "length_6")
  .text("7", "length_7")
  .text("8", "length_8")
  .text("9", "length_9")
  .text("10", "length_10")
  .text("0", "length_0")
  .build();

const worddifficulty_1 = new InlineKeyboardBuilder(2)
  .text("0", "diff_0")
  .text("1", "diff_1")
  .text("2", "diff_2")
  .text("3", "diff_3")
  .text("4", "diff_4")
  .text("5", "diff_5")
  .build();

const keyboard_start_setting = new ReplyKeyboardBuilder()
  .text("Start the game")
  .text("Change settings")
  .build({ resize_keyboard: true, is_persistent: true });

const wordlength_keyboard = new ReplyKeyboardBuilder()
  .text("4")
  .text("5")
  .text("6")
  .text("7")
  .text("8")
  .text("9")
  .text("10")
  .text("0")
  .build({ resize_keyboard: true, is_persistent: true });

const worddifficulty = new ReplyKeyboardBuilder()
  .text("0")
  .text("1")
  .text("2")
  .text("3")
  .text("4")
  .text("5")
  .build({ resize_keyboard: true, is_persistent: true });

async function WordGenerator(settings = {}) {
  const { length, diff } = settings;

  let url = new URL("https://random-word-api.herokuapp.com/word");

  if (length >= 4 && length <= 10) {
    url.searchParams.set("length", String(length));
  }

  if (diff >= 1 && diff <= 5) {
    url.searchParams.set("diff", String(diff));
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "telegram-word-game-bot",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return fallback_words;
    }

    const data = await response.json();
    const word = data[0];

    return word;
  } catch (err) {
    return fallback_words;
  }
}

async function start_game_output(ctx) {
  const word = await WordGenerator(userSettings.get(ctx.message?.chat.id));

  const randomIndex = Math.floor(Math.random() * word.length);
  const target_letter = word[randomIndex];
  const text = ctx.message?.text;
  const chatId = ctx.message?.chat.id;
  const username = ctx.message?.from?.username ?? "unknown";

  console.log(`@${username} | chat ID: ${chatId} | message: ${text}`);
  console.log("Word:", target_letter);
  console.log("Word", word);

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
  return;
}

async function set_setting_initialize(ctx) {
  const chatId = ctx.message?.chat.id;
  const game = games.get(chatId);

  if (game) {
    game.isPlaying = false;
  }

  userDialogStates.set(chatId, "waiting");

  await ctx.reply(
    "Enter the length of the word you want to guess, 4 - 10, 0 means random",
    {
      reply_markup: wordlength_keyboard_1,
    },
  );
  return;
}

bot
  .command("start_game", async (ctx) => {
    start_game_output(ctx);
  })

  .command("settings", async (ctx) => {
    set_setting_initialize(ctx);
  })

  .on("message", async (ctx) => {
    const text = ctx.message?.text;

    const trimmed = text?.trim() ?? "";
    const chatId = ctx.message?.chat.id;

    const state = userDialogStates.get(chatId);
    if (trimmed == "/start") {
      await ctx.reply(
        "Welcome to the guess word game! Please enter input /start_game or click the start button!",

        {
          reply_markup: keyboard_start_setting,
        },
      );
      return;
    } else if (trimmed == "Start the game") {
      start_game_output(ctx);
      return;
    } else if (trimmed == "Change settings") {
      set_setting_initialize(ctx);
      return;
    }

    if (state === "waiting") {
      const num = Number(trimmed);

      if (!Number.isInteger(num) || num < 0 || num > 10) {
        await ctx.reply("PLease enter a valid number between 4 - 10, or 0", {
          reply_markup: keyboard_start_setting,
        });
        return;
      }

      userSettings.set(chatId, {
        length: num,
        diff: 0,
      });

      userDialogStates.set(chatId, "difficult");

      await ctx.reply(
        "choose the difficulty of the game between 1 to 5, 1 is easy and 5 is hard, 0 means random",

        {
          reply_markup: worddifficulty_1,
        },
      );
      return;
    }

    if (state === "difficult") {
      const num = Number(trimmed);

      if (!Number.isInteger(num) || num < 0 || num > 5) {
        await ctx.reply(
          "please choose between 0-5, 0 is default, 1 is easy, and 5 is hard.",
          {
            reply_markup: worddifficulty,
          },
        );
        return;
      }

      userSettings.get(chatId).diff = num;
      userDialogStates.set(chatId, "default");

      await ctx.reply(
        "Finised setting!\n" +
          `The current level：\n` +
          `length：${userSettings.get(chatId).length == 0 ? "random" : userSettings.get(chatId).length}\n` +
          `diffivulty：${userSettings.get(chatId).diff == 0 ? "default" : userSettings.get(chatId).diff}\n` +
          `enter /start_game to start the game!@!`,
        {
          reply_markup: keyboard_start_setting,
        },
      );
      return;
    }

    const game = games.get(chatId);

    if (!game || !game.isPlaying) {
      await ctx.reply("You have not started a game yet. Send /start_game.", {
        reply_markup: keyboard_start_setting,
      });
      return;
    }

    const guess = trimmed.toLowerCase();
    const word = game.word.toLowerCase();

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

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery?.data;
  const chatId = ctx.callbackQuery?.message?.chat.id;

  await ctx.answerCallbackQuery();

  if (chatId === undefined || typeof data !== "string") {
    return;
  }

  const state = userDialogStates.get(chatId);

  if (data.startsWith("length_")) {
    if (state !== "waiting") {
      await ctx.reply("Please send /settings to choose the length again.");
      return;
    }

    const length = Number(data.replace("length_", ""));

    if (
      !Number.isInteger(length) ||
      (length !== 0 && (length < 4 || length > 10))
    ) {
      await ctx.reply("Please choose 4–10, or 0 for random.");
      return;
    }

    userSettings.set(chatId, {
      length,
      diff: 0,
    });

    userDialogStates.set(chatId, "difficult");

    await ctx.reply("Choose the difficulty between 1 and 5. 0 means random.", {
      reply_markup: worddifficulty_1,
    });

    return;
  }

  if (data.startsWith("diff_")) {
    if (state !== "difficult") {
      await ctx.reply("Please send /settings to choose the settings again.");
      return;
    }

    const diff = Number(data.replace("diff_", ""));

    if (!Number.isInteger(diff) || diff < 0 || diff > 5) {
      await ctx.reply("Please choose a difficulty between 0 and 5.");
      return;
    }

    const settings = userSettings.get(chatId);

    if (!settings) {
      await ctx.reply("Please send /settings and choose the length first.");
      return;
    }

    settings.diff = diff;
    userDialogStates.set(chatId, "default");

    await ctx.reply(
      "Finished setting!\n" +
        `Length: ${settings.length === 0 ? "random" : settings.length}\n` +
        `Difficulty: ${settings.diff === 0 ? "default" : settings.diff}\n` +
        "Enter /start_game to start the game!",
      {
        reply_markup: keyboard_start_setting,
      },
    );

    return;
  }
});

await run(bot);
