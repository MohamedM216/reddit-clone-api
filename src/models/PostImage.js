class PostImage {
  constructor({
    id,
    post_id,
    file_name,
    file_path,
    mime_type,
    size,
    order_index,
    created_at
  }) {
    this.id = id;
    this.postId = post_id;
    this.fileName = file_name;
    this.filePath = file_path;
    this.mimeType = mime_type;
    this.size = size;
    this.orderIndex = order_index;
    this.createdAt = created_at;
  }

  toJSON() {
    return {
      id: this.id,
      postId: this.postId,
      fileName: this.fileName,
      url: `/uploads/${this.fileName}`,
      mimeType: this.mimeType,
      size: this.size,
      orderIndex: this.orderIndex,
      createdAt: this.createdAt
    };
  }
}

module.exports = PostImage;