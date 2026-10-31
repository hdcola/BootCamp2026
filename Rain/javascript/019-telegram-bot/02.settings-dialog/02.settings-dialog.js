import 'dotenv/config'

import { Bot } from 'node-telegram-bot-api'
import { run } from 'node-telegram-bot-api/node'


const token = process.env.BOT_TOKEN
const bot = new Bot(token)

const userDialogStates = new Map()

let person = new Map()




bot.api.setMyCommands({
    commands: [
        {
            command: "start",
            description: "The start of the game"
        },
        {
            command: "setting",
            description: "The start of the game"
        }

    ]
})

bot.command("setting", async (ctx) => {
    userDialogStates.set(ctx.from.id, "WAITING_LENGTH")
    await ctx.reply("Please choose the lenght of the word, Max:7 and Min:4. If you input a inccorect number, it will result in something random")
    const UserId = ctx.from.id
    await createPlayer(UserId)
    console.log(person)

})

bot.command("start", async (ctx) => {

    const UserId = ctx.from.id
    await createPlayer(UserId)
    const player = person.get(UserId)

    userDialogStates.set(ctx.from.id, "Game")

    await getWord(ctx, player)

    ctx.reply(` we will be playing a game of guessing your word now take your guesse, the words lenght is ${player.length}`)


})


bot.on("message", (ctx) => {

    const UserId = ctx.from.id
    const player = person.get(UserId)

    const userState = userDialogStates.get(ctx.from.id)

    let args = (ctx.message?.text)


    if (userState == "WAITING_LENGTH") {
        console.log("detected state")
        console.log(player)
        if (args >= 4 && args <= 7) {
            player.length = Number(args)
        } else {
            player.length = Math.floor(Math.random() * 6) + 1

        }
        console.log(player)
        userDialogStates.delete(UserId)
        ctx.reply(`your lenght is ${player.length}`)
        userDialogStates.set(ctx.from.id, "WAITING_DIFF")
        ctx.reply("Choose your difficulty, from 1-5")
    } else if (userState == "WAITING_DIFF") {
        if (args >= 1 && args <= 5) {
            player.diff = Number(args)
        } else {
            console.log(player)
            player.diff = Math.floor(Math.random() * 4) + 1
        }
        console.log(player)
        ctx.reply("setting is complete please now use /start to start the game")
    } else if (userState == "Game") {
        const WOrds = player.word[0]

        const gameWord = new Set(WOrds)

        const mySet = new Set(args)
        console.log(gameWord)
        console.log(mySet)
        let mysteriousAmount = ""


        console.log(gameWord.intersection(mySet))


       if (WOrds.includes(args)) {
            player.succesfulLetter.add(args)
            ctx.reply("successful guess")
        } else {
            ctx.reply("uncorrect")
        }
        let hasUnderline = false
        for (let i = 0; i < WOrds.length; i++) {
            for (let j = 0; j < args.length; j++) {
                if (player.succesfulLetter.has(WOrds[i])) {
                    mysteriousAmount += WOrds[i]

                } else {
                    mysteriousAmount += "_"
                    hasUnderline = true
                }
            }
        }
        console.log(hasUnderline)
        if(hasUnderline === false){
            ctx.reply(`you did it the word is ${WOrds}`)
        }else{
        ctx.reply(mysteriousAmount)
        }
        


    }


})


async function createPlayer(UserId) {
    const player = {
        id: UserId,
        TimeUsed: 0,
        word: null,
        diff: 1,
        length: 7,
        succesfulLetter: new Set()


    }
    person.set(UserId, player)
}

async function getWord(ctx, player) {
    const difficulty = player.diff
    const length = player.length

    const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${length}&diff=${difficulty}`);
    const data = await response.json();
    return player.word = data
}




await run(bot)