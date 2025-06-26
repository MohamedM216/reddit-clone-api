class User {
  constructor({
    id,
    username,
    email,
    password, // hashed
    bio,
    karma,
    role,
    email_verified,
    created_at
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.bio = bio;
    this.karma = karma || 0;
    this.role = role || 'user';
    this.emailVerified = email_verified || false;
    this.createdAt = created_at;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      bio: this.bio,
      karma: this.karma,
      role: this.role,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;