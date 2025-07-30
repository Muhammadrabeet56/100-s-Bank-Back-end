const express = require('express');
const UserModel = require('../models/User.Model')
const router = express.Router();
const {body}  = require('express-validator')
const UserControllers = require('../Controllers/User.Controller')
const middlewares = require('../middlewares/Auth')
const upload = require('../middlewares/Multer')
const applicationUpload = require('../middlewares/applicationMulter');
const parser = require('../middlewares/CloudinaryMulter');



 router.post('/register', parser.single("profileImage"), [
     body('email').isEmail().withMessage('Invalid Email'),
     body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long'),
     body('RegNo').isLength({min: 10}).withMessage('Registration Number must be 10 characters long'),
     body('StudentName').isLength({min: 3}).withMessage('Name must be at least 3 characters long'),
     body('phoneNo').isNumeric().withMessage('Phone Number must be a number'),
 ]
 , UserControllers.RegisterUser

)
router.post('/verify', [
    body('otp').isLength({min: 6}).withMessage('OTP must be 6 characters long'),
    body('email').isEmail().withMessage('Invalid Email'),
],
   UserControllers.VerifyUser

)
router.post('/resendOtp', [
    body('email').isEmail().withMessage('Invalid Email'),
],
   UserControllers.ResendOtp

)

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long'),
],
   UserControllers.LoginUser

)

router.post('/logout', UserControllers.logoutUser );

router.get('/showData',middlewares.authuser, UserControllers.ShowData)

router.post('/application',middlewares.authuser,
     parser.fields([
    { name: 'cnicFrontImage', maxCount: 1 },
    { name: 'cnicBackImage', maxCount: 1 },
    { name: 'electricityBillImage', maxCount: 1 },
    { name: 'gasBillImage', maxCount: 1 },
    { name: 'waterBillImage', maxCount: 1 },
  ]),
  // middlewares.authuser, [
  //   body('studentName').notEmpty().withMessage('Student Name is required'),
  //   body('regNo').notEmpty().withMessage('Registration Number is required'),
  //   body('semester').notEmpty().withMessage('Semester is required'),
  //   body('cgpa').notEmpty().withMessage('CGPA is required'),
  //   body('dept').notEmpty().withMessage('Department is required'),
  //   body('loanAmount').notEmpty().withMessage('Loan Amount is required'),
  //   body('loanPurpose').notEmpty().withMessage('Loan Purpose is required'),
  // ],
  UserControllers.Loanapplication
);
router.put('/updateProfile/:id', 
    upload.single("profileImage"),middlewares.authuser, [
    body('email').isEmail().withMessage('Invalid Email'),
    body('RegNo').isLength({min: 10}).withMessage('Registration Number must be 10 characters long'),
    body('StudentName').isLength({min: 3}).withMessage('Name must be at least 3 characters long'),
    body('phoneNo').isNumeric().withMessage('Phone Number must be a number'),
],
   UserControllers.UpdateProfile

)

router.get('/loandetails', middlewares.authuser, UserControllers.fetchloandetails)
module.exports = router;