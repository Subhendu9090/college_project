import mongoose from "mongoose";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema
  = new mongoose.Schema({
    fullname: {
      type: String,
      required: [true, "please enter full name"]
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    rollNo: {
      type: String,
      required: true,
      unique: true,

    },
    registrationNo: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: [true, "password is required"]
    },
    avatar: {
      type: String,
      required: [true, "Image is required"]
    },
    hostel: {
      type: String,
      required: [true, "please enter accurate hostel name"]
    },
    status: {
      type: Boolean,
      default: false
    },
    mealStatus:{
      type:Boolean,
      default:true,
    },
    onMeal:{
      type:Number,
      default:0
    },
    offMeal:{
      type:Number,
      default:0
    },
    lastOffMealTime:{
      type:Date,
      default:0
    },
    refreshToken: {
      type: String
    }
  },
    { timestamps: true }
  );

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    this.password = await bcryptjs.hash(this.password, 5);
    next();
  })

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcryptjs.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      rollno: this.rollno,
      registrationNo: this.registrationNo,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }

  )
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRETE,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema)
