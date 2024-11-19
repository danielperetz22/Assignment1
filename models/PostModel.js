const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: false,
  },
  senderId: { 
    type: String,
    required: true, 
  },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);