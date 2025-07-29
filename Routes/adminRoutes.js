const express = require('express');
const router = express.Router();
const AdminController = require('../Controllers/adminController');
const  Stripecontroller = require('../Controllers/stripeController');


router.post('/login', AdminController.adminLogin);
router.post('/register', AdminController.adminRegister);
router.get('/users' , AdminController.Users)

// router.put('/updateProfile/:id', 
//     upload.single("profileImage"),middlewares.authuser, [
//     body('email').isEmail().withMessage('Invalid Email'),
//     body('RegNo').isLength({min: 10}).withMessage('Registration Number must be 10 characters long'),
//     body('StudentName').isLength({min: 3}).withMessage('Name must be at least 3 characters long'),
//     body('phoneNo').isNumeric().withMessage('Phone Number must be a number'),
// ],
//    UserControllers.UpdateProfile

// )
router.delete('/deleteUser/:id', AdminController.deleteUser)
router.get('/loanApplications', AdminController.LoanApplication);
router.patch('/updateLoanApplication/:id', AdminController.updateLoanApplication);
// router.patch('/updateUserApplication/:id', AdminController.updateUserApplication);
router.delete('/deleteLoanApplication/:id', AdminController.DeleteLoanApplication);
router.get('/loanstatus', AdminController.status);
router.get('/stripe/payers', Stripecontroller.getPaymentLinkAnalytics);

module.exports = router;