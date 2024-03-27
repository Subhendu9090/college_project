import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema({
   fullname: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true,
      unique:true
   },
   mobileNo :{
      type:Number,
      unique:true
   },
   secret: {
      type: String,
      required: [true, "enter secret code"]
   },
   refreshToken: {
      type: String
   }

})

adminSchema.methods.generateAccessToken= async function(){
  return jwt.sign(
      {
         _id:this._id,
         fullname:this.fullname,
         email:this.email
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn:process.env.ACCESS_TOKEN_EXPIRY
      }
   )
}
adminSchema.methods.generateRefreshToken= async function(){
  return jwt.sign(
      {
         _id:this._id,
         
      },
      process.env.REFRESH_TOKEN_SECRETE,
      {
         expiresIn:process.env.REFRESH_TOKEN_EXPIRY
      }
   )
}

export const Admin =mongoose.model("Admin",adminSchema)