const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  _postId: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
});
commentsSchema.set("timestamps", true);

module.exports = mongoose.model("Comments", commentsSchema);
