import 'dotenv/config'

import { Bot } from 'node-telegram-bot-api'
import { run } from 'node-telegram-bot-api/node'



const token = process.env.BOT_TOKEN
const bot = new Bot(token)

let person = new Map()



function createPlayer(UserId) {
    const player = {
        id: UserId,
        TimeUsed: 0,
        number: Math.floor(Math.random() * 100) + 1

        
    }
    person.set(UserId, player)
} 

bot.command("start", (ctx) => {

    const UserId = ctx.from.id

    createPlayer(UserId)
    person.number


    ctx.reply(" we will be playing a game of guessing nubers now take your guesse")
})


bot.on("message", (ctx) => {



console.log('recive a message')
    const UserId = ctx.from.id

    let player = person.get(UserId)
    player.TimeUsed++
    let random = player.number

    let args = (ctx.message?.text)

    if (random < args) {
        ctx.reply("too big")
    } else if (random > args) {
        ctx.reply("too small")
    } else if (random == args) {
        ctx.reply("correct and your attempt used was " + player.TimeUsed)
        player.number = Math.floor(Math.random() * 100) + 1
        player.TimeUsed = 0
    }
    console.log(random)
})

await run(bot)