const express = require('express');
const authMiddleware = require('../middlewares/auth');
const cloudinary = require('../config/cloudinary.config');
const upload = require('../config/multer.config');
const fileModel = require('../models/files.models');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('login')
})

// Home route to list user files
router.get('/home', authMiddleware, async (req, res) => {
  try {
    const userFiles = await fileModel.find({ user: req.user.userId });
    console.log(userFiles);

    res.render('home', { files: userFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// File upload route
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const newFile = await fileModel.create({
      path: req.file.path, // Cloudinary URL
      originalname: req.file.originalname,
      user: req.user.userId,
    });
    
    res.redirect('/home');

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File upload failed', details: err.message });
  }
});

// File download route
router.get('/download/:path', authMiddleware, async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const path = req.params.path;

    const file = await fileModel.findOne({ user: loggedInUserId, path });

    if (!file) {
      return res.status(401).json({ message: 'Unauthorized: File not found' });
    }

    // Redirect to Cloudinary URL
    res.redirect(file.path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File download failed', details: err.message });
  }
});

// DELETE file route
router.delete('/delete/:id', async (req, res) => {
    try {
        const fileId = req.params.id;

        // Find the file in the database
        const file = await fileModel.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Extract the public ID from the Cloudinary URL
        const publicId = file.path.split('/').pop().split('.')[0]; // Extracts the public ID

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(`uploads/${publicId}`);

        // Delete from the database
        await fileModel.findByIdAndDelete(fileId);

        res.json({ success: true, message: 'File deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
