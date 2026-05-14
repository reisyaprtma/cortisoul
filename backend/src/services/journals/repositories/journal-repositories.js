import { nanoid } from 'nanoid';
import { Pool } from 'pg';

class JournalRepositories {
  constructor() {
    this._pool = new Pool();
  }

  async createJournal({ title, content, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: `INSERT INTO journals(id, title, content, created_at, updated_at, owner)
              VALUES($1, $2, $3, $4, $5, $6)
              RETURNING id`,
      values: [id, title, content, createdAt, updatedAt, owner],
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

    return result.rowCount > 0 ? true : null;
  }
}

export default new JournalRepositories();
