const nodemailer = require("nodemailer");

const UserModel = require("../models/User.Model");


module.exports.transpoter = async () => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });
    return transporter;
}
