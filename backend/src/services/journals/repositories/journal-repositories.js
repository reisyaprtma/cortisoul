import { nanoid } from 'nanoid';
import pool from '../../../config/database.js';

class JournalRepositories {
  constructor() {
    this._pool = pool;
  }

  async createJournal({
    title,
    content,
    owner,
    stressScore = null,
    emotion = null,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: `INSERT INTO journals(id, title, content, created_at, updated_at, stress_score, emotion, owner)
              VALUES($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING id`,
      values: [
        id,
        title,
        content,
        createdAt,
        updatedAt,
        stressScore,
        emotion,
        owner,
      ],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getJournals(owner) {
    const query = {
      text: 'SELECT * FROM journals WHERE owner = $1',
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getJournalById(id) {
    const query = {
      text: 'SELECT * FROM journals WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async editJournalById({ id, title, content }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE journals SET title = $1, content = $2, updated_at = $3 WHERE id = $4 RETURNING *',
      values: [title, content, updatedAt, id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deleteJournalById(id) {
    const query = {
      text: 'DELETE FROM journals WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async verifyJournalOwner(id, owner) {
    const query = {
      text: `
        SELECT 1 FROM journals
        WHERE id = $1 AND owner = $2
      `,
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  async getWeeklyStressLevels(owner, startDate, endDate) {
    const query = {
      text: `
        SELECT
          DATE(created_at) AS date,
          ROUND(AVG(stress_score), 1) AS average_score
        FROM journals
        WHERE owner = $1
          AND created_at >= $2
          AND created_at <= $3
          AND stress_score IS NOT NULL
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `,
      values: [owner, startDate, endDate],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getWeeklyEmotionSummary(owner, startDate, endDate) {
    const query = {
      text: `
        SELECT
          emotion AS label,
          COUNT(*)::int AS count
        FROM journals
        WHERE owner = $1
          AND created_at >= $2
          AND created_at <= $3
          AND emotion IS NOT NULL
        GROUP BY emotion
        ORDER BY count DESC
      `,
      values: [owner, startDate, endDate],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default new JournalRepositories();
