class Post {
  constructor({
    id,
    user_id,
    title,
    content,
    link,
    image_url,
    type,
    vote_count,
    created_at
  }) {
    this.id = id;
    this.userId = user_id;
    this.title = title;
    this.content = content;
    this.link = link;
    this.imageUrl = image_url;
    this.type = type;
    this.voteCount = vote_count || 0;
    this.createdAt = created_at;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      content: this.content,
      link: this.link,
      imageUrl: this.imageUrl,
      type: this.type,
      voteCount: this.voteCount,
      createdAt: this.createdAt
    };
  }
}

module.exports = Post;