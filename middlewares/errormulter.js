const multer = require('multer');
const path = require('path');
const err = require('multer/lib/make-error');

module.exports.errorHandel = async (req,res,next)=>{
   
    if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum 5MB allowed'
      });
    }
    // Handle other Multer errors
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  // Handle other errors
  next(err);
}