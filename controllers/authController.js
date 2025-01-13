import { signupSchema, signinSchema } from "../middlewares/validator.js";
import User from "../models/usersModel.js";
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing.js";
import jwt from "jsonwebtoken";
import transporter from "../middlewares/sendMail.js";


export const signup = async (req, res) => {
  const { email, password } = req.body;
    try{
           const {error,value}  = signupSchema.validate({email,password});
           
           if(error){
            return res.status(401).json({success:false, message: error.details[0].message}); 
           }
         const existingUser = await User.findOne({email});

         if(existingUser){
            return res.status(401).json({success:false, message: "User already exists"});
         }
         const hashedPassword = await doHash(password, 12);
      
         const newUser = new User({
            email,
            password: hashedPassword,
         })
         const result = await newUser.save();
         result.password = undefined;
         res.status(201).json({success:true, data: result, message: "User created successfully"}); 
         
    }
    catch(error){
        return res.status(500).json({ error: error.message });
    }

 };


 export const signin = async (req, res) => {
    const {email, password} = req.body;
    try {
      const {error, value} = signinSchema.validate({email, password});
      
      if(error){
        return res.status(401).
        json({success:false, message: error.details[0].message});
      }

      const existingUser = await User.findOne({email}).select("+password");
      if(!existingUser){
        return res
        .status(401)
        .json({success:false, message: "User does not exist"});

      };
        const result = await doHashValidation(password, existingUser.password);
        if(!result){
          return res.status(401).json({success:false, message: "Invalid password"});
        };

      const token = jwt.sign({
        email: existingUser.email,
        id: existingUser._id, 
        verified: existingUser.verified
      
      },process.env.TOKEN_SECRET, {
        expiresIn: "8h"
      });

       res.cookie(
         'Authorization', 'Bearer' 
         + token ,{expires : new Date(Date.now() + 8 * 3600000),
          httpOnly: process.env.NODE_ENV === 'production',
          secure: process.env.NODE_ENV === 'production'
      }).json({success:true, data: existingUser, token: token, message: "User logged in successfully"});
     
  
   } catch (error) {
     return res.status(500).json({ error: error.message });
   
   }
 }

export const signout = async (req, res) => {
  res.clearCookie('Authorization');
  res.json({success:true, message: "User logged out successfully"});

}; 


  

 export const sendVerificationEmail = async (req, res) => {
 const {email} = req.body;
 try{
  const existingUser = await User.findOne({email});

  if(!existingUser){
    return res
    .status(404)
    .json({success:false, message: email,message: "User does not exist"});

  }
  if(existingUser.verified){
    return res
    .status(400)
    .json({success:false, message: "User already verified"});
  }
  const codeValue = Math.floor(Math.random() * 1000000).toString();
 let info = await transporter.sendMail({
    from:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    to : existingUser.email,
    subject: "Email Verification",
    html: `<h1> Your verification code is ${codeValue}</h1>`
 })

 if(info.accepted[0] === existingUser.email){
 const hashedCode = await hmacProcess(codeValue, process.env.HMACHASH_SECRET);
 existingUser.verificationCode = hashedCode;
 existingUser.verificationCodeValidation = Date.now();
await existingUser.save();

  return res.status(200).json({
    success:true, 
    message: "Verification code sent successfully"
  });
 }
 res.status(400).json({success:false, message: "Error sending email"});

 }catch(error){
    return res.status(500).json({ error: error.message });
 }
};

export default {
  signup,
 signin,
 signout,
  sendVerificationEmail
};