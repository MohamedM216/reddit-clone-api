class Post {
  constructor({
    id,
    user_id,
    content,
    image_url,
    vote_count,
    created_at
  }) {
    this.id = id;
    this.userId = user_id;
    this.content = content;
    this.imageUrl = image_url;
    this.voteCount = vote_count || 0;
    this.createdAt = created_at;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      content: this.content,
      imageUrl: this.imageUrl,
      voteCount: this.voteCount,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Post;