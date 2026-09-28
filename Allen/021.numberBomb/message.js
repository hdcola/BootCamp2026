export const messages = {
  welcomeMsg: `<b>💣 单人数字炸弹：4 位密码破解战已开始！</b>

我已经想好了一个 4 位数字密码（每位数字 0~9，允许重复，例如 0523、7719）。

📌 规则说明：
• 每次发送一个 4 位数字进行猜测。
• 我会告诉你：有几个数字数值正确且位置正确。
• 当 4 个数字全部猜对时即获胜！

👉 请直接在下方输入你的 4 位猜测数字（如 1234）：`,
  newGameMsg: "🎮 已经开始一个新的游戏，请输入一个 4 位数字！",
  invalidGuessMsg: "请输入一个有效的 4 位数字，例如 1234。",
  winMsg: ({ password, guessCount, history }) =>
    `🎉 恭喜你！你猜对了密码：${password}

🔢 总共猜测：${guessCount} 次
📊 历史猜测记录：
${history.join(", ")}

💣 游戏结束！如果你想再玩一次，请发送 /new 开始新的游戏或者直接发送新的猜测🤨。`,
  guessResultMsg: ({ guess, correctPosition, guessCount }) =>
    `🔍 你的猜测：${guess}

🎯 正确且位置正确：${correctPosition} / 4 个
📊 当前累计猜测：${guessCount} 次

💪 请根据线索继续输入你的下一次猜测：`,
};
