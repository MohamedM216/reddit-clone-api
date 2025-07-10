class Post {
  constructor({
    id,
    user_id,
    content,
    vote_count,
    created_at
  }) {
    this.id = id;
    this.userId = user_id;
    this.content = content;
    this.voteCount = vote_count || 0;
    this.createdAt = created_at;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      content: this.content,
      voteCount: this.voteCount,
      createdAt: this.createdAt
    };
  }
}

module.exports = Post;