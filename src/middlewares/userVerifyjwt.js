import { ApiError } from "../utils/ApiError.js"
import { asyncHandeler } from "../utils/asyncHandeler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandeler(async (req, _, next) => {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
       // console.log("token",token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access token")
        }

        req.user = user;
        next()

    } catch (error) {
        console.error("Error verifying access token:", error);
        throw new ApiError(401, "Invalid access token")
    }
})