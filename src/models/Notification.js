class Notification {
  constructor({
    id,
    user_id,
    sender_id,
    post_id,
    comment_id,
    type,
    read,
    created_at,
    updated_at
  }) {
    this.id = id;
    this.userId = user_id;
    this.senderId = sender_id;
    this.postId = post_id;
    this.commentId = comment_id;
    this.type = type;
    this.read = read;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      read: this.read,
      createdAt: this.createdAt,
      senderId: this.senderId,
      userId: this.userId,
      postId: this.postId,
      commentId: this.commentId,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Notification;