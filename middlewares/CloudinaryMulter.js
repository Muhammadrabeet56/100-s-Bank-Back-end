// middlewares/cloudinaryUpload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'uploads',
    format: 'jpg', // or determine from file.mimetype
    public_id: `${file.fieldname}-${Date.now()}`,
  }),
});

const parser = multer({ storage });

module.exports = parser;
