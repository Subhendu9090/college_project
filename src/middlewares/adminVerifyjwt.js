import { asyncHandeler } from "../utils/asyncHandeler.js";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const adminVerifyJWT = asyncHandeler(async(req, _, next)=>{
   const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

   if (!token) {
     throw new ApiError(400,"Token is not find")
   }
try {
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

  const admin= await Admin.findById(decodedToken?._id).select("-refreshToken")

  if (!admin) {
    throw new ApiError(401,"Invalid accessToken")
  }
req.admin=admin
next()

} catch (error) {
    throw new ApiError(400,"Invalid access Token")
}

})