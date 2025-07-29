// Loan Application Model (Mongoose example)
const mongoose = require('mongoose');
const loanApplicationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phoneNo: { type: String, required: true },
  studentName: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  semester: { type: Number, required: true },
  cgpa: { type: Number, required: true },
  dept: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  loanPurpose: { type: String, default: 'Education' },
  fatherName: { type: String, required: true },
  fatherOccupation: { type: String, required: true },
  fatherSalary: { type: Number, required: true },
  siblings: { type: Number, required: true },
  additionalNotes: { type: String, default: '' },
  cnicFrontImage: { type: String, required: true },
  cnicBackImage: { type: String, required: true },
  electricityBillImage: { type: String, required: true },
  gasBillImage: { type: String, required: true },
  waterBillImage: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected'], 
    default: 'pending' 
  },
  applicationDate: { type: Date, default: Date.now },
 
}, { timestamps: true });

module.exports.LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);