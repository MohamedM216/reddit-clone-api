class Comment {
  constructor({
    id,
    user_id,
    post_id,
    parent_id,
    content,
    vote_count,
    created_at
  }) {
    this.id = id;
    this.userId = user_id;
    this.postId = post_id;
    this.parentId = parent_id;
    this.content = content;
    this.voteCount = vote_count || 0;
    this.createdAt = created_at;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      postId: this.postId,
      parentId: this.parentId,
      content: this.content,
      voteCount: this.voteCount,
      createdAt: this.createdAt
    };
  }
}

module.exports = Comment;