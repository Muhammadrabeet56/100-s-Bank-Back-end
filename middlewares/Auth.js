const userModel = require('../models/User.Model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


module.exports.authuser = async (req,res,next)=>{
    console.log(req.cookies)
    console.log(req.headers)

    const token = req.cookies.Token ||req.headers.authorization?.split(' ')[1]
    if(!token){
        return res.status(401).json({error: 'unauthorized'})
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decode.id)
        req.user = user;
        console.log(req.user)
        return next();
    } catch (error) {
        return res.status(401).json({error: 'unauthorized'})
        
    }
}