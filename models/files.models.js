const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: [true, 'Path is required'], // Stores the Cloudinary URL of the file
  },
  originalname: {
    type: String,
    required: [true, 'Original name is required'], // Stores the original file name
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', // References the 'users' collection
    required: [true, 'User is required'],
  },
  uploadedAt: {
    type: Date,
    default: Date.now, // Automatically stores the upload timestamp
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
