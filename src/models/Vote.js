class Vote {
  constructor({ user_id, post_id, comment_id, value }) {
    this.userId = user_id;
    this.postId = post_id;
    this.commentId = comment_id;
    this.value = value;
  }
}

module.exports = Vote;