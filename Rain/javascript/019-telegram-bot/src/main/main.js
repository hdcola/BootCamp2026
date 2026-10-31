import 'dotenv/config'

import { Bot } from 'node-telegram-bot-api'
import { run } from 'node-telegram-bot-api/node'

const token = process.env.BOT_TOKEN

const bot = new Bot(token)




bot.command("echo", (ctx) => {
    const args = (ctx.match) 
    return ctx.reply(args)
})

bot.on("message", (ctx) => {
    const text = ctx.message?.text;
    if (text) return ctx.reply(text)
})

bot.catch((err, ctx) => {
    console.error(`update for chat ${ctx.chatId} failed:`, err);
})

await run(bot);

console.log(process.env.BOT_TOKEN)

