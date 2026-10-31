import 'dotenv/config'

import { Bot } from 'node-telegram-bot-api'
import { run } from 'node-telegram-bot-api/node'

const token = process.env.BOT_TOKEN

const bot = new Bot(token)

bot.command("start", (ctx) => {
    console.log("starting game, this is a game about guessing the numbers and throughout the game, your score will be recorded and latter demonstrated")
})
