const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://mnadeem7556:Nadeem7556@confess.8llgbmy.mongodb.net/mongodb?retryWrites=true&w=majority"
);
console.log("DB connected successfully");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
