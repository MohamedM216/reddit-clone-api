const BaseRepository = require('./base.repository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super('users', User);
  }

  async findById(id) {
    const user = await super.findById(id);
    if (!user) return null;
    return user;
  }

  async findByEmail(email) {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows.length ? new this.modelClass(result.rows[0]) : null;
  }

  async findByUsername(username) {
    const result = await this.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows.length ? new this.modelClass(result.rows[0]) : null;
  }

  async incrementKarma(userId, amount = 1) {
    const result = await this.query(
      'UPDATE users SET karma = karma + $1 WHERE id = $2 RETURNING *',
      [amount, userId]
    );
    return result.rows.length ? new this.modelClass(result.rows[0]) : null;
  }

  async create(userData) {
    const existingEmail = await this.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already in use');
    }

    const existingUsername = await this.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    return super.create(userData);
  }

  async update(id, userData) {
    if (userData.email) {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use by another account');
      }
    }

    if (userData.username) {
      const existingUser = await this.findByUsername(userData.username);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Username already taken');
      }
    }

    return super.update(id, userData);
  }
}

module.exports = new UserRepository();