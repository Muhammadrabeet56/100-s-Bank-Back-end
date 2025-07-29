const AdminModel = require("../models/Admin.Model");
const LoanApplicationModal = require("../models/LoanApplication.modal");
const jwt = require('jsonwebtoken');
const UserModel = require("../models/User.Model")
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const otpServices = require('../Services/OptServices');


module.exports.Users = async(req,res)=>{
    try {
        const users  = await UserModel.find()
        console.log(users)
        res.status(200).json({sucess:true , users})
    } catch (error) {
        console.log('Error to fetching users' , error)
        res.status(400).json({message : 'Error to Fetching users' , error})
        
    } 

};
module.exports.status = async (req, res) => {
  try {
    // // First check what status values actually exist
    // const statusValues = await LoanApplicationModal.distinct("status");
    // console.log("Existing status values:", statusValues);

    const aggregation = await LoanApplicationModal.LoanApplication.aggregate([
      { $match: { status: { $exists: true } } }, // Only docs with status field
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    console.log("Aggregation result:", aggregation);

    // Dynamic response format
    const result = {};
    aggregation.forEach(item => {
      result[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      statusCounts: result // Returns whatever statuses exist
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports.LoanApplication = async (req, res) => {
  try {
    // Fetch all loan applications and optionally populate the 'user' field
    const applications = await LoanApplicationModal.LoanApplication.find().populate('user', 'name email'); // change fields as needed

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No loan applications found',
      });
    }

    console.log('Fetched Applications:', applications);

    return res.status(200).json({
      success: true,
      applications,
    });

  } catch (error) {
    console.error('Error fetching loan applications:', error);

    return res.status(500).json({
      success: false,
      message: 'Error fetching loan applications',
      error: error.message,
    });
  }
};

module.exports.updateLoanApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, userID, loanAmount , loanPurpose } = req.body;

        // Find and update loan application
        const application = await LoanApplicationModal.LoanApplication.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Loan application not found' });
        }

        // Find the user by userID
        const user = await UserModel.findById(userID);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Load the HTML template
        const htmlPath = path.join(__dirname, '../email/loanStatusTemplate.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Customize status message
        const statusMessage = status === 'Approved'
            ? '🎉 Congratulations! Your loan application has been <strong>Approved</strong>. You can now proceed with the next steps. and Contact with our support Team <br> contact : +92-3057228059'
            : '❌ Unfortunately, your loan application has been <strong>rejected</strong> after review. For more info, please contact support.';
        console.log('Status Message:', statusMessage);
        // Replace placeholder in HTML template
        htmlContent = htmlContent
        .replace('{{STATUS_MESSAGE}}', statusMessage)
        .replace('{{USER_EMAIL}}', user.email || 'N/A')
        .replace('{{USER_ID}}', user._id || 'N/A')
  .replace('{{USER_NAME}}', user?.StudentName || 'User')
  .replace('{{REGISTRATION_NUMBER}}', user?.RegNo || 'N/A')
  .replace('{{LOAN_STATUS}}', status || 'Pending')
  .replace('{{LOAN_PURPOSE}}', user?.loanPurpose|| 'N/A')
  .replace('{{LOAN_AMOUNT}}', user?.loanAmount.toLocaleString() || 'N/A');

     
        // Send Email
        const transporter = await otpServices.transpoter();

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Loan Application Status Update',
            html: htmlContent,
        });
        const updatedUser = await UserModel.findByIdAndUpdate(
            userID,
            { loan: status , loanAmount, loanPurpose  },
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: 'Loan status updated and email sent successfully.',
            application,
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating loan application:', error);
        res.status(500).json({
            message: 'Error updating loan status or sending email',
            error
        });
    }
};

// module.exports.updateUserApplication = async(req,res)=>{
//     try {
//         const {id} = req.params
//         const {loan} = req.body
//         console.log('id', id)
//         console.log('loan', loan)
//         const application = await UserModel.findByIdAndUpdate(id, {loan}, {new: true});
//         if(!application){
//             return res.status(404).json({message : 'User application not found'})
//         }
//         res.status(200).json({sucess:true , message : 'User application updated successfully', application})
//     }
//     catch (error) {
//         console.log('Error to updating user application' , error)
//         res.status(400).json({message : 'Error to updating user application' , error})
//     }

// };
module.exports.DeleteLoanApplication = async(req,res)=>{
    try {
        const {id} = req.params
        const application = await LoanApplicationModal.LoanApplication.findByIdAndDelete(id)
        if(!application){
            return res.status(404).json({message : 'Loan application not found'})
        }
        res.status(200).json({sucess:true , message : 'Loan application deleted successfully'})
        
    } catch (error) {
        console.log('Error to deleting loan application' , error)
        res.status(400).json({message : 'Error to deleting loan application' , error})
    }

};
module.exports.deleteUser = async(req,res)=>{
    try {
        const {id} = req.params
        const user = await UserModel.findByIdAndDelete(id)
        if(!user){
            return res.status(404).json({message : 'User not found'})
        }
        res.status(200).json({sucess:true , message : 'User deleted successfully'})
        
    } catch (error) {
        console.log('Error to deleting user' , error)
        res.status(400).json({message : 'Error to deleting user' , error})
    }
}

module.exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate JWT token
    const Token = jwt.sign({
            id: admin._id,
            email: admin.email,
            name: admin.name,
        },
        process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: "Login successful", admin , Token });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new AdminModel({
      name,
      email,
      password: hashedPassword
    });
     const Token = jwt.sign({
            id: newAdmin._id,
            email: newAdmin.email,
            name: newAdmin.name,
        },
        process.env.JWT_SECRET, { expiresIn: '1h' });
    
        newAdmin.Token= Token

    await newAdmin.save();
    res.status(201).json({ success: true, message: "Admin registered successfully", admin: newAdmin , Token });
  } catch (error) {
    console.error("Error during admin registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
