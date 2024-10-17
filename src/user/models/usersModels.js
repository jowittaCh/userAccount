const mongoose =require("mongoose");
const Schema = mongoose.Schema ;

const userSchema = new Schema({ 
    firstName: { type: String, required: true }, 
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: {type:Number,required:true, unique: true},
    password: { type: String, required: true },
    dateOfBirth: { type: String, required: true }
  });
  
  module.exports = mongoose.model("user", userSchema);