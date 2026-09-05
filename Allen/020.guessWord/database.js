import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";

mkdirSync("./data", { recursive: true });

const db = new DatabaseSync("./data/game.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS achievements (
    user_id INTEGER NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, achievement_id)
  )
`);

export function unlockAchievement(userId, achievementId) {
  const statement = db.prepare(`
    INSERT OR IGNORE INTO achievements (
      user_id,
      achievement_id
    )
    VALUES (?, ?)
  `);

  const result = statement.run(userId, achievementId);

  return result.changes > 0;
}

export function getAchievements(userId) {
  const statement = db.prepare(`
    SELECT achievement_id, unlocked_at
    FROM achievements
    WHERE user_id = ?
    ORDER BY unlocked_at
  `);

  return statement.all(userId);
}