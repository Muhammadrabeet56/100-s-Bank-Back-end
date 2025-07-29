const LoanApplicationModel = require('../models/LoanApplication.modal');
const UserModel = require('../models/User.Model');



module.exports.CreateUser = async ({
    email, 
    password, 
    RegNo, 
    StudentName,
    phoneNo,
    cnic,
    semester,
    Dept,
    otp,
    otpExpiresIn,
    profileImage,

})=>{
   if(!RegNo , !StudentName, !password , !email , !phoneNo,!cnic,!Dept,!semester, !otp, !profileImage){
    throw new Error('All fields are required')
   }
    const newUser = UserModel.create({
        email,
        password,
        RegNo,
        StudentName,
        phoneNo,
        cnic,
        semester,
        Dept,
        otp,
        otpExpiresIn,
        profileImage,
    })  
    return newUser;

}

module.exports.CreateApplicant = async ({
  email,
  phoneNo,
  studentName,
  regNo,
  semester,
  cgpa,
  dept,
  loanAmount,
  loanPurpose,
  fatherName,
  fatherOccupation,
  fatherSalary,
  siblings,
  additionalNotes,
  // cnicFrontImage,
  // cnicBackImage,
  // electricityBillImage,
  // gasBillImage,
  // waterBillImage,
  UserId
}) => {
  // Validate required fields
  if (
    !email ||
    !phoneNo ||
    !studentName ||
    !regNo ||
    !semester ||
    cgpa === undefined ||
    !dept ||
    !loanAmount ||
    !loanPurpose ||
    !fatherName ||
    !fatherOccupation ||
    !fatherSalary ||
    siblings === undefined ||
    !cnicFrontImage ||
    !cnicBackImage ||
    !electricityBillImage ||
    !gasBillImage ||
    !waterBillImage ||
    !UserId
  ) {
    throw new Error('All required fields must be filled.');
  }

  // Create new loan application
  const newApplicant = await LoanApplicationModel.create({
    email,
    phoneNo,
    studentName,
    regNo,
    semester,
    cgpa,
    dept,
    loanAmount,
    loanPurpose,
    fatherName,
    fatherOccupation,
    fatherSalary,
    siblings,
    additionalNotes: additionalNotes || "", // Optional
    cnicFrontImage,
    cnicBackImage,
    electricityBillImage,
    gasBillImage,
    waterBillImage,
    UserId,
  });

  return newApplicant;
};
