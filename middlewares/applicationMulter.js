// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG/PNG images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB
});

module.exports = upload.fields([
  { name: 'cnicFrontImage', maxCount: 1 },
  { name: 'cnicBackImage', maxCount: 1 },
  { name: 'electricityBillImage', maxCount: 1 },
  { name: 'gasBillImage', maxCount: 1 },
  { name: 'waterBillImage', maxCount: 1 }
]);

