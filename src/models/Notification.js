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
    sender_username,
    comment_preview,
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
    this.senderUsername = sender_username;
    this.commentPreview = comment_preview;
    this.updatedAt = updated_at;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      read: this.read,
      createdAt: this.createdAt,
      sender: {
        id: this.senderId,
        username: this.senderUsername
      },
      id: this.postId,
      comment: this.commentId ? {
        id: this.commentId,
        preview: this.commentPreview?.substring(0, 100)
      } : null,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Notification;