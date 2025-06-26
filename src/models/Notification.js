class Notification {
  constructor({
    id,
    user_id,
    sender_id,
    post_id,
    comment_id,
    type,
    read,
    created_at
  }) {
    this.id = id;
    this.userId = user_id;
    this.senderId = sender_id;
    this.postId = post_id;
    this.commentId = comment_id;
    this.type = type;
    this.read = read || false;
    this.createdAt = created_at;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      senderId: this.senderId,
      postId: this.postId,
      commentId: this.commentId,
      type: this.type,
      read: this.read,
      createdAt: this.createdAt
    };
  }
}

module.exports = Notification;