class PostLink {
  constructor({
    id,
    post_id,
    url
  }) {
    this.id = id;
    this.postId = post_id;
    this.url = url;
  }

  toJSON() {
    return {
      id: this.id,
      postId: this.postId,
      url: this.url
    };
  }
}

module.exports = PostLink;