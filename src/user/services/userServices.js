const errorMessages = require("../../../error");
const jwt = require("jsonwebtoken");
const { Request, Response } =require('express');
const bcrypt = require("bcryptjs");
const userModel  =require("../models/usersModels");
require('dotenv').config(); 
const validator =require("validator");
const moment =require("moment");

const findUserByEmail = async (email) => {
    const aUser = await userModel.findOne({ email: email });
    return aUser;
  };


const comparePassword = async (enteredPassword, storedHashedPassword) => {
    return await bcrypt.compare(enteredPassword, storedHashedPassword);
};


const findUserFromToken = async (req) => { 
    const authHeader = req.headers["authorization"]; //authHeader : This object contains all the headers sent in the HTTP request. Each header is a key-value pair.
    
if(!authHeader){
   throw new Error("Authorization header is missing");
}
const token =  authHeader.split(" ")[1];
if (!token) {
   throw new Error("Token is missing");
}

   const key =process.env.SECRET_KEY;
   console.log(key);
   const decoded = jwt.verify(token, key);
   console.log(decoded);
   const userId = decoded.id;
   console.log(userId);
 
   return userId;
 };

 const validateAndHash=async({ password, email, dateOfBirth ,phoneNumber })=> {
  
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    if (!validator.isEmail(email)) {
        throw new Error('Invalid email format.');
    }

    if (!moment(dateOfBirth, 'DD-MM-YYYY', true).isValid()) {
        throw new Error('Invalid date format. Must be DD-MM-YYYY.');
    }

    const phoneRegex = /^[0-9]{8}$/;  // Regular expression to match 9 digits
    if (!phoneRegex.test(phoneNumber)) {
        throw new Error('Phone number must contain exactly 8 digits.');
    }

    return {
        hashedPassword,
        email,
        dateOfBirth,
        phoneNumber
    };
}

 

const createUser= async (req)=>{
    const  {  firstName, lastName, email, phoneNumber, password, dateOfBirth} = req.body;
    
   
    let buser = await findUserByEmail(email);
console.log(buser);
    if (buser) {

        const error= new Error(errorMessages.userExists.message);
        error.statusCode = errorMessages.userExists.statusCode;
        throw error;
      } else {
    const result = await validateAndHash({ password, email, dateOfBirth, phoneNumber });    
      await new userModel({
          
          firstName: firstName, 
          lastName: lastName,
          email: result.email, 
          phoneNumber: result.phoneNumber,
          password: result.hashedPassword,
          dateOfBirth: result.dateOfBirth,
    }
        ).save();
      }
      return {message: "User successfully Signed Up "};
    };
  
const logInUser = async(req)=>{
    const  { email, password } = req.body;
    let buser = await findUserByEmail(email);
    let checkpass =await comparePassword(password , buser.password);
    if (!buser || !checkpass ) {
        const error= new Error(errorMessages.userNoExists.message);
        error.statusCode = errorMessages.userNoExists.statusCode;
        throw error;
    }
    const id = buser._id ;
    const toSignAccess = {
        exp: Math.floor(Date.now() / 1000) + 20 * 60,
        /*Date.now() : current time in ms since january 1, 1970 
        / 1000 : converts the ms to s
        + :add the extra time which is the exp date 
        60 * 20 : 20 minutes
        */
        id: id,
      };
     const toSignRefresh ={
          exp: Math.floor(Date.now() / 1000) + 200 * 600,
          id: id,
        };

        const key =process.env.SECRET_KEY;
      const accessToken = jwt.sign((toSignAccess), key );
      console.log(accessToken);
      const refreshToken =jwt.sign((toSignRefresh), key );
return { message: "User successfully signed In",
    accessToken,
    refreshToken
 };
}


const fetchUserInfo =async(req)=>{
const verify = await findUserFromToken(req);
const user = await userModel.findOne({ _id: verify });

        if (!user) {
            const error= new Error(errorMessages.invalid.message);
        error.statusCode = errorMessages.invalid.statusCode;
        throw error;
        }

        else{
console.log(user);
const userInfo ={
    firstName: user.firstName,
  lastName:user.lastName, 
  email:user.email ,
  phoneNumber: user.phoneNumber,
  dateOfBirth: user.dateOfBirth,
}
return userInfo ;
        }
    } 

const updateUserInfo =async(req)=>{
    const verify = await findUserFromToken(req);
    const user = await userModel.findOne({ _id: verify });
    
            if (!user) {
                const error= new Error(errorMessages.invalid.message);
            error.statusCode = errorMessages.invalid.statusCode;
            throw error;
            }
    
            else{
const email = req.body.email && validator.isEmail(email) ? req.body.email : user.email;
if (!validator.isEmail(email)) {
    throw new Error('Invalid email format.');
}

const dateOfBirth = req.body.dateOfBirth && moment(req.body.dateOfBirth, 'YYYY-MM-DD', true).isValid() ? req.body.dateOfBirth : user.dateOfBirth;
if (!moment(dateOfBirth, 'DD-MM-YYYY', true).isValid()) {
    throw new Error('Invalid date format. Must be DD-MM-YYYY.');
}
 
const phoneNumber = req.body.phoneNumber && /^[0-9]{8}$/.test(req.body.phoneNumber) ? req.body.phoneNumber : user.phoneNumber;
const phoneRegex = /^[0-9]{8}$/;  // Regular expression to match 8 digits
if (!phoneRegex.test(phoneNumber)) {
    throw new Error('Phone number must contain exactly 8 digits.');
}
      
    const updatedUser = await userModel.findByIdAndUpdate(
        user._id, 
        { $set: {
            firstName: req.body.firstName ,
            lastName: req.body.lastName ,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            dateOfBirth: req.body.dateOfBirth,

        } },  // Update only the fields provided
        { new: true, runValidators: true }  // Return the updated user, apply schema validation
    );
  
                return {message: "User updated",};
 
}
}

const updatePassword=async(req)=>{
    const verify = await findUserFromToken(req);
    const user = await userModel.findOne({ _id: verify });
    if(!user){
        const error= new Error(errorMessages.invalid.message);
        error.statusCode = errorMessages.invalid.statusCode;
        throw error;
    }

let {oldPassword , newPassword ,comfirmPassword} =req.body ;
const dbPass = user.password;

   const checkpass =await comparePassword(oldPassword , dbPass)
   if (!checkpass) {
      const error = new Error(errorMessages.incorrectPass.message);
      error.statusCode = errorMessages.incorrectPass.statusCode;
      throw error;
  } 
  console.log("neww:"+ newPassword + "confirm: " +comfirmPassword);
if(newPassword !== comfirmPassword ){
    const error= new Error(errorMessages.noMatch.message);
    error.statusCode = errorMessages.noMatch.statusCode;
    throw error;
}
if(newPassword.length < 8){
    const error= new Error("less then 8 characters");
    throw error;
}
const hashedPasswordTwo = await bcrypt.hash(newPassword, 12);
 req.body.newPassword =hashedPasswordTwo;

const updatedPass = await userModel.findByIdAndUpdate(
    user._id, 
    { $set: {password: req.body.newPassword}   },  // Update only the fields provided
    { new: true, runValidators: true }  // Return the updated user, apply schema validation
);

                    return {message: "password updated",};

};

const deleteUser =async(req)=>{
    const verify = await findUserFromToken(req);
    const result = await userModel.deleteOne({_id: verify });
   
    if (result.deletedCount === 0) {
        const error= new Error(errorMessages.invalid.message);
        error.statusCode = errorMessages.invalid.statusCode;
        throw error;
    }

    console.log('User deleted successfully');
    return {message: "User successfully deleted",} ;


}

const getAccessToken =async(req)=>{
    const authHeader = req.headers["authorization"];
    if(!authHeader){
        throw new Error("Authorization header is missing");
     }
     const token =  authHeader.split(" ")[1];
     if (!token) {

        const error= new Error(errorMessages.invalid.message);
        error.statusCode = errorMessages.invalid.statusCode;
        throw error;
     }
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    if(payload.id){
        const userId = payload.id;
        const toSignAccess = {
            exp: Math.floor(Date.now() / 1000) + 20 * 60,
            id: userId,
          };
        
        const acccessToken = jwt.sign( (toSignAccess) ,process.env.SECRET_KEY);
 return {accessToken : acccessToken};
    }
    else{
        const error = new Error(errorMessages.userNoExists.message);
        error.statusCode = errorMessages.userNoExists.statusCode;
        throw error;
    }
}

module.exports={
createUser,
logInUser,
updateUserInfo,
fetchUserInfo,
deleteUser,
getAccessToken,
updatePassword,
}