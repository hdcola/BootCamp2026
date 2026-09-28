/**
 * 所有正在进行中的游戏
 *
 * 这个数据结构使用 `chatId:userId` 作为唯一的 `key`，用于区分不同聊天中的不同用户；对应的 `value` 是一个对象，其中 `password` 保存当前生成的密码，`guessCount` 记录用户已经猜测的次数，`history` 则以字符串数组的形式保存用户之前的猜测记录。
 *
 * @type {Map<string, { password: string, guessCount: number, history: string[] }>}
 *
 */
const games = new Map();

/**
 * 创建游戏
 * @returns {Object<{ password: string, guessCount: number, history: string[] }>}
 */
function createGame() {
  return {
    password: generateRandomPassword(),
    guessCount: 0,
    history: [],
  };
}

/**
 * 获得当前用户的游戏 ID
 * @param {Object} ctx
 * @returns {string}
 */
function getGameId(ctx) {
  return `${ctx.chat.id}:${ctx.from.id}`;
}

/**
 * 获得游戏，如果不存在，就自动创建一个
 * @param {Object} ctx
 * @returns {Object<{ password: string, guessCount: number, history: string[] }>}
 */
function getGame(ctx) {
  const gameId = getGameId(ctx);

  if (!games.has(gameId)) {
    games.set(gameId, createGame());
  }

  return games.get(gameId);
}

/**
 * 重置游戏
 * @param {Object} ctx
 * @returns {Object<{ password: string, guessCount: number, history: string[] }>}
 */
function resetGame(ctx) {
  const gameId = getGameId(ctx);

  const game = createGame();

  games.set(gameId, game);

  return game;
}

/**
 * 生成随机 4 位密码
 * @returns {string}
 */
function generateRandomPassword() {
  const digits = "0123456789";

  let password = "";

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);

    password += digits[randomIndex];
  }

  return password;
}

/**
 * 比较猜测
 *
 * @param {string} guess
 * @param {string} password
 * @returns {{ correctPosition: number }}
 */
function compareGuess(guess, password) {
  let correctPosition = 0;

  const remainingPassword = [];
  const remainingGuess = [];

  // 第一轮：检查位置和数字都正确
  for (let i = 0; i < 4; i++) {
    if (guess[i] === password[i]) {
      correctPosition++;
    } else {
      remainingPassword.push(password[i]);
      remainingGuess.push(guess[i]);
    }
  }

  return {
    correctPosition,
  };
}

/**
 * 检查输入
 * @param {string} guess
 * @returns {boolean}
 */
function isValidGuess(guess) {
  return /^\d{4}$/.test(guess);
}

export {
  games,
  createGame,
  getGameId,
  getGame,
  resetGame,
  generateRandomPassword,
  compareGuess,
  isValidGuess,
};
