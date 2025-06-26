const { query } = require('../utils/db');

class BaseRepository {
  constructor(tableName, modelClass) {
    this.tableName = tableName;
    this.modelClass = modelClass;
  }

  async findById(id) {
    const result = await query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows.length ? new this.modelClass(result.rows[0]) : null;
  }

  async findAll() {
    const result = await query(`SELECT * FROM ${this.tableName}`);
    return result.rows.map(row => new this.modelClass(row));
  }

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const result = await query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return new this.modelClass(result.rows[0]);
  }

  async update(id, data) {
    const setClause = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = Object.values(data);
    values.push(id);

    const result = await query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows.length ? new this.modelClass(result.rows[0]) : null;
  }

  async delete(id) {
    const result = await query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`, [id]);
    return result.rows.length ? new this.modelClass(result.rows[0]) : null;
  }
}

module.exports = BaseRepository;