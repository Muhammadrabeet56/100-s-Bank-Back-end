const UserModel =require('../models/User.Model')
const {validationResult} = require ('express-validator')
const UserServices = require('../Services/User.Services')
const otpServices = require('../Services/OptServices')
const crypto = require("crypto");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { response, request } = require('../app')
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');



module.exports.RegisterUser = async (req,res)=>{
    // const errors = validationResult(req)
    // if(!errors.isEmpty){
    //     return res.status(400).json({errors: errors.formatWith()})
    // }

    const {email, password, RegNo, StudentName, phoneNo , Dept , semester , cnic } = req.body;
    console.log(req.body)
    console.log(req.file)
    const profileImagePath = req.file ? req.file.path : null;
    if (!profileImagePath) {
        return res.status(400).json({ message: 'Profile image is required' });
    }
    console.log(profileImagePath)


    const HashedPassword = await UserModel.HashPassword(password)
    const userExists = await UserModel.findOne({email})
    if(userExists){
        return res.status(400).json({message: 'User already exists'})
    }
    const userExistsRegNo = await UserModel.findOne({RegNo})
    if(userExistsRegNo){
        return res.status(400).json({message: 'User already exists'})
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    console.log(otp)
    console.log(otpExpiresIn)
    const user = await UserServices.CreateUser({
        email: email,
        password: HashedPassword, 
        RegNo: RegNo,
        StudentName: StudentName,
        cnic: cnic,
        semester: semester,
        Dept: Dept,
        otp: otp,
        otpExpiresIn: otpExpiresIn,
        phoneNo: phoneNo,
        profileImage: profileImagePath,
    })
    console.log(user)
    const htmlPath = path.join(__dirname, '../email/email.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace('{{OTP_CODE}}', otp);

    const transporter = await otpServices.transpoter(); // call the function
    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: req.body.email,
        subject: "Your OTP Code",
        html: htmlContent,
    }), (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Error sending OTP' });
        } else {
            console.log('Email sent: ' + info.response);
        }
    };
    const Token = jwt.sign({
        id: user._id,
        email: user.email,
        RegNo: user.RegNo,
        StudentName: user.StudentName,
    },
    process.env.JWT_SECRET, { expiresIn: '1h' });

    user.Token= Token

    res.status(200).json({
        message: 'User created successfully',
        user,
        
    }

    )


 }
module.exports.VerifyUser = async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const {otp,email} = req.body;
    const user = await UserModel.findOne({email})

    if(!user){
        return res.status(400).json({message: 'Invalid Credentials'})
    }
    if(user.isVerified){
        return res.status(400).json({message: 'User already verified'})
    }
    if(user.otpExpiresIn < Date.now() || user.otp !== otp){
      
        return res.status(400).json({message: 'OTP expired'})
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresIn = undefined;

    await user.save();


    res.json({
        message: 'User verified successfully',
        user,
        
    }) 
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Internal server error' , error: error.message}) 
    }
}
module.exports.ResendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find the user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        // Generate new OTP and expiry
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        console.log('Generated OTP:', otp);
        console.log('OTP Expiry Time:', otpExpiresIn);

        user.otp = otp;
        user.otpExpiresIn = otpExpiresIn;
        await user.save();

        // Load the email HTML template
        const htmlPath = path.join(__dirname, '../email/email.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        htmlContent = htmlContent.replace('{{OTP_CODE}}', otp);

        // Create transporter and send the email
        const transporter = await otpServices.transpoter();
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "OTP Verification - FinBankApp",
            html: htmlContent,
        });

        return res.status(200).json({
            message: 'OTP sent successfully. Please check your email.',
        });

    } catch (error) {
        console.error('Error in ResendOtp:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

 module.exports.LoginUser = async (req,res)=>{
    const errors = validationResult(req)
    // if(!errors.isEmpty()){
    //     return res.status(400).json({errors: errors.array()})
    // }

    const {email, password} = req.body;

    const user = await UserModel.findOne({email})

    if(!user){
        return res.status(401).json({message: 'User not found'})
    }

    const isMatch = await bcrypt.compare(password , user.password);

    if(!isMatch){
        return res.status(401).json({message: 'Invalid credentials'})
    }


    const Token = jwt.sign({
        id: user._id,
        email: user.email,
        RegNo: user.RegNo,
        StudentName: user.StudentName,
    },
    process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('Token', Token, { httpOnly: true, secure: true, sameSite: 'strict' });

    res.status(200).json({
        message: 'User logged in successfully',
        user,
        Token,
    }

    )
 }
 module.exports.logoutUser = async (req,res) => {
  try {
    // Option 1: Simple logout (just client-side token removal)
    // -----------------------------------------
    res.clearCookie('Token', {
      httpOnly: true,
      secure: true, // Use secure cookies in production
      sameSite: 'strict' // Helps prevent CSRF attacks
    });
    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
};

 module.exports.ShowData = async (req,res)=>{
    const user = await UserModel.findOne(req.user)
    res.json({user})
 }

module.exports.Loanapplication = async (req, res) => {
  try {
    console.log('Body fields:', req.body);
    console.log('Uploaded files:', req.files);

    // Validate required fields
    const requiredFields = [
      'email', 'phoneNo', 'studentName', 'regNo', 'semester', 
      'cgpa', 'dept', 'loanAmount', 'fatherName', 
      'fatherOccupation', 'fatherSalary', 'siblings'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate required files
    const requiredFiles = [
      'cnicFrontImage', 'cnicBackImage', 
      'electricityBillImage', 'gasBillImage', 'waterBillImage'
    ];
    
    const missingFiles = requiredFiles.filter(file => !req.files?.[file]);
    if (missingFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required files',
        missingFiles
      });
    }
   const uploadedFiles = {};
      Object.keys(req.files || {}).forEach(field => {
        uploadedFiles[field] = req.files[field][0].path; // Cloudinary URL
      });
    console.log('Uploaded files paths:', uploadedFiles);

    // Prepare application data
    const applicationData = {
      email: req.body.email,
      phoneNo: req.body.phoneNo,
      studentName: req.body.studentName,
      regNo: req.body.regNo,
      semester: parseInt(req.body.semester),
      cgpa: parseFloat(req.body.cgpa),
      dept: req.body.dept,
      loanAmount: parseFloat(req.body.loanAmount),
      loanPurpose: req.body.loanPurpose || 'Education',
      fatherName: req.body.fatherName,
      fatherOccupation: req.body.fatherOccupation,
      fatherSalary: parseFloat(req.body.fatherSalary),
      siblings: parseInt(req.body.siblings),
      additionalNotes: req.body.additionalNotes || '',
      user: req.user._id,
      status: 'pending',
       cnicFrontImage: uploadedFiles.cnicFrontImage || '',
      cnicBackImage: uploadedFiles.cnicBackImage || '',
      electricityBillImage: uploadedFiles.electricityBillImage || '',
      gasBillImage: uploadedFiles.gasBillImage || '',
      waterBillImage: uploadedFiles.waterBillImage || '',
    };

    // Create and save application
    const LoanApplication = mongoose.model('LoanApplication');
    const newApplication = new LoanApplication(applicationData);
    await newApplication.save();

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: newApplication
    });

  } catch (error) {
    console.error('Error in Loanapplication:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Registration number already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports.UpdateProfile = async (req, res) => {
  try {
    const { StudentName, phoneNo, password } = req.body;
    const userId = req.user._id;

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (StudentName) user.StudentName = StudentName;
    if (phoneNo) user.phoneNo = phoneNo;
    
    // Handle password update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save updated user
    await user.save();

    // Return updated user (excluding sensitive data)
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.__v;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userObj
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

module.exports.fetchloandetails = (req, res) => {
  const userId = req.user._id;
  UserModel.findById(userId)
    .select('loan loanAmount loanPurpose')
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({
        success: true,
        loanDetails: {
          loanStatus: user.loan,
          loanAmount: user.loanAmount,
          loanPurpose: user.loanPurpose
        }
      });
    })
    .catch(error => {
      console.error('Error fetching loan details:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    });
}