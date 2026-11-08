
import 'dotenv/config';
import { Bot } from 'node-telegram-bot-api';
import { run } from 'node-telegram-bot-api/node';

const bot = new Bot(process.env.BOT_TOKEN);


const games = new Map();   // 当前正在进行的局
const sets = new Map();
const userdialogstates = new Map();
// const record = new Map()


bot.api.setMyCommands({
    commands: [
        { command: 'start', description: '🎮 开始猜单词游戏' },
        { command: 'stop', description: '🔚 结束本局游戏' },
        { command: 'settings', description: '⚙️ 游戏设置（单词长度与难度）' }
    ],

})


bot.command('settings', (ctx) => {
    const id = ctx.from.id;

    if (!sets.has(id)) {
        sets.set(id, { length: 0, diff: 0 })
        userdialogstates.set(id, { status: 'IDLE' })
    }
    const setstatus = userdialogstates.get(id)
    if (setstatus.status === 'IDLE') {
        setstatus.status = 'WAITING_LENGTH'
        ctx.reply('📌【第 1/2 步】请输入期望的单词长度（3 ~ 10 之间的数字，输入 0 表示随机）');
        return
    }
    if (setstatus.status === 'WAITING_LENGTH') {
        ctx.reply('请输入 3 到 10 之间的整数，或输入 0 表示随机长度：');
        return
    }
    if (setstatus.status === 'WAITING_DIFF') {
        ctx.reply(`✅ 单词长度已设置为：${sets.get(id).length} 字母
难度设置请输入 1 到 5 之间的整数，或输入 0 表示随机难度：`);
        return
    }
})

async function fetchRandomWord(leng, diff) {
    let l = 0
    let d = 0
    if (leng === 0) {
        l = Math.floor(Math.random() * 8) + 3
    } else { l = leng }
    if (diff === 0) {
        d = Math.floor(Math.random() * 5) + 1
    } else { d = diff }
    try {
        const res = await fetch(`https://random-word-api.herokuapp.com/word?length=${l}&diff=${d}`);
        const data = await res.json();
        return data[0];            // 从数组里取出单词
    } catch (err) {
        console.log('获取单词失败：', err.message);
        return 'apple';            // 请求失败时返回一个备用词，比如 'apple' 
    }
}

function getRandomLetter(word) {
    return word[Math.floor(word.length * Math.random())]
}

bot.command('start', async (ctx) => {
    const id = ctx.from.id;
    const name = ctx.from.first_name
    let l = 0
    let d = 0
    if (sets.has(id)) {
        l = sets.get(id).length
        d = sets.get(id).diff
    }
    userdialogstates.set(id, { status: 'IDLE' })
    const thewords = await fetchRandomWord(l, d)

    games.set(id,
        { answer: thewords, wrongs: 0, guessed: [getRandomLetter(thewords)], gameanswer: [] }
    );
    const game = games.get(id)
    game.gameanswer = game.answer.split('').filter((x) => x !== game.guessed[0])

    console.log('存进去的:', games);

    const text = maskWord(game.answer, game.guessed)
    console.log('text:', text);

    await ctx.reply('让我们愉快的猜单词吧！我已经想好了一个单词，你来猜吧');
    await ctx.reply(name + ": " + text + ` 猜了${game.wrongs}次`)
});

bot.command('stop', (ctx) => {
    const id = ctx.from.id;
    const name = ctx.from.first_name
    const game = games.get(id)
    let shown

    if (!games.has(id)) {
        ctx.reply(name + ",目前并没有您的游戏局,如果想参加请输入 /start ")
        return
    }
    shown = maskWord(game.answer, game.answer)
    ctx.reply(name + ": " + shown + ` 很遗憾,您失败了,一共猜错过${game.wrongs}次`)
    console.log(name + ": " + "答案是:" + " " + shown + `很遗憾,失败了,一共用了${game.wrongs}次`)
    games.delete(id)
})

function maskWord(word, guseeset) {
    let shown = ''
    for (const ch of word) {
        if (guseeset.includes(ch)) {
            shown += ch
            shown += ' '
        } else {
            shown += '_ '
        }
    }

    return shown.trim()

}
async function wins(game, ctx, text) {
    const shown = maskWord(game.answer, game.answer)
    await ctx.reply(ctx.from.first_name + ": " + shown + ` 恭喜你,猜对了,一共用了${game.wrongs}次`)
    await ctx.reply('还想开始情按 /start')
    console.log(ctx.from.first_name + ": " + "猜的:" + text + "   " + shown + `恭喜你,猜对了,一共用了${game.wrongs}次`)
    games.delete(ctx.from.id)
}
function guesswrong(game, ctx, text) {
    game.wrongs++
    const shown = maskWord(game.answer, game.guessed)
    ctx.reply(ctx.from.first_name + ": " + shown + ` 猜错了,已经猜错${game.wrongs}次`)
    console.log(ctx.from.first_name + ": " + "猜的:" + text + "   " + shown + ` 猜错了,已经猜错${game.wrongs}次`)

}

bot.hears(/^[a-zA-Z]+$/, (ctx) => {

    const id = ctx.from.id
    const name = ctx.from.first_name
    const text = ctx.message.text.toLowerCase().trim()
    const game = games.get(id)

    if (!userdialogstates.has(id)) { return }
    if (userdialogstates.get(id).status === 'WAITING_LENGTH') {
        ctx.reply('❌ 输入无效！请输入 3 到 10 之间的整数，或输入 0 表示随机长度：')
        return
    }
    if (userdialogstates.get(id).status === 'WAITING_DIFF') {
        ctx.reply('❌ 输入无效！请输入 0 到 5 之间的整数（1~5 为难度等级，0 为随机）：')
        return
    }
    if (!games.has(id)) { return }

    if (text.length === 1) {
        if (game.guessed.includes(text)) {
            const shown = maskWord(game.answer, game.guessed)
            ctx.reply(name + ": " + shown + ` 这个字母已经猜过了 已经猜错${game.wrongs}次`)
            return
        }
        if (!game.answer.includes(text)) {
            game.guessed.push(text)

            guesswrong(game, ctx, text)
            return
        }
        game.guessed.push(text)
        game.gameanswer = game.gameanswer.filter((x) => x !== text)
        // console.log(gameanswer)

        if (game.gameanswer.length !== 0) {
            const shown = maskWord(game.answer, game.guessed)
            ctx.reply(name + ": " + shown + ` 这个字母对了,已经猜错${game.wrongs}次`)
            console.log(name + ": " + "猜的:" + text + "   " + shown + `这个字母对了,已经猜错${game.wrongs}次`)
            return
        }
        wins(game, ctx, text)
        return

    }
    if (text.length === game.answer.length) {
        if (text !== game.answer) {
            guesswrong(game, ctx, text)
            return
        }

        wins(game, ctx, text)
        return
    }
    ctx.reply("你要是想猜整个单词的话也要数数字数啊")

})


bot.on('message', (ctx) => {
    const id = ctx.from.id
    const name = ctx.from.first_name
    const message = ctx.message.text
    const numb = Number(message)

    if (!userdialogstates.has(id)) { return }
    const idstates = userdialogstates.get(id)
    if (idstates.status === 'WAITING_LENGTH') {
        if (!(Number.isInteger(numb) && (numb === 0 || (numb >= 3 && numb <= 10)))) {
            ctx.reply('❌ 输入无效！请输入 3 到 10 之间的整数，或输入 0 表示随机长度：')
            return
        }
        idstates.status = 'WAITING_DIFF'
        sets.get(id).length = numb
        ctx.reply(`✅ 单词长度已设置为：${sets.get(id).length} 字母
📌【第 2/2 步】请输入游戏难易度等级（1 ~ 5）：
    · 1 - 🟢 简单（常见高频词）
    · 2 - 🟡 较易
    · 3 - 🟠 中等
    · 4 - 🔴 较难
    · 5 - 🟣 困难（生僻稀有词）
    · 0 - 🎲 随机/默认难度`)
        return

    }
    if (idstates.status === 'WAITING_DIFF') {
        if (!(Number.isInteger(numb) && (numb >= 0 && numb <= 5))) {
            ctx.reply('❌ 输入无效！请输入 0 到 5 之间的整数（1~5 为难度等级，0 为随机）：')
            return
        }
        idstates.status = 'IDLE'
        sets.get(id).diff = numb
        ctx.reply(`🎉 设置已成功保存！
📏 单词长度：${sets.get(id).length} 个字母
🎯 游戏难度：（Level ${sets.get(id).diff}）
💡 发送 /start 即可按新配置开启游戏！`)
        return

    }
    if (!games.has(id)) { return }
    // 拿出这个人的局信息:

    ctx.reply(name + ",请猜单个字母或纯字母的单词,如果不想玩了请输入 /stop !")
    console.log(name + "发了不合规输入,输入了" + ctx.message.text)


});


run(bot);
console.log('机器人已启动');
