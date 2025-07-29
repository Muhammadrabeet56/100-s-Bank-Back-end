const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')



const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    RegNo: {
        type: String,
        required: true,
        unique: true,
        // match: /^uet-nfc-fd-bsc-\d{1,4}$/, // Matches the format "uet-nfc-fd-bsc-<any number>"
      },
    StudentName: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    Dept: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true,
    },
    cnic:{
        type: String,
        required: true,
        unique: true
    },
   loan: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    loanAmount: {
        type: Number,
        default: 0
    },
    loanPurpose: {
        type: String,
        default: ''
    },
    otp:{
        type: String
    },
    otpExpiresIn:{
        type: Date
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    profileImage:{
        type: String,
        default: null
    }
})

// UserSchema.methods.generateAuthToken = ()=>{
//     const Token = jwt.sign({
//         id: this._id,
//         email: this.email,
//         RegNo: this.RegNo,
//         StudentName: this.StudentName,
//     },
//     process.env.JWT_SECRET, { expiresIn: '7d' });
// }

UserSchema.methods.ComparePassword = ()=>{
    return bcrypt.comapre(password, this.password);
}

UserSchema.statics.HashPassword = (password)=>{
    return bcrypt.hash(password, 10);
}

const UserModel = mongoose.model('User' ,UserSchema);

module.exports = UserModel;