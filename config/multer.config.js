const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary.config'); // Import Cloudinary configuration

// Configure CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Replace with your preferred folder name in Cloudinary
    format: async (req, file) => 'jpg', // Optional - Specify file format (e.g., jpg, png)
    public_id: (req, file) => file.originalname.split('.')[0], // Use file name without extension
  },
});

// Set up multer with Cloudinary storage
const upload = multer({ storage });

module.exports = upload;
