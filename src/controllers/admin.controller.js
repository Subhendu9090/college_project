import { asyncHandeler } from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Admin } from "../models/admin.model.js"
import { User } from "../models/user.model.js"

const generateAccessAndRefreshToken = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);

        const accessToken = await admin.generateAccessToken();
        const refreshToken = await admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(400, `accessToken and refreshToken generation failed : ${error}`)
    }
}

const adminRegister = asyncHandeler(async (req, res) => {
    const { fullname, email, mobileNo, secret } = req.body;

    if ([fullname, email, mobileNo, secret].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "please enter fullname,email and correct secrete")
    }

    if (secret !== process.env.ADMIN_SECRET) {
        throw new ApiError(401, " please enter currect secrete")
    }

    const existAdmin = await Admin.findOne({
        $or: [{ email }, { mobileNo }]
    })

    if (existAdmin) {
        throw new ApiError(400, "you are already exist please login")
    }

    const admin = await Admin.create({
        fullname,
        email,
        mobileNo,
        secret
    })

    const createdAdmin = await Admin.findById(admin._id).select("-secret");

    if (!createdAdmin) {
        throw new ApiError(400, "admin creation failed please try after some time")
    }

    res.status(200)
        .json(new ApiResponse(200, createdAdmin, "registration successful"))

})

const adminLogin = asyncHandeler(async (req, res) => {
    const { email, mobileNo, secret } = req.body

    if (!(email || mobileNo)) {
        throw new ApiError(400, "please enter correct email or mobile number")
    }

    const existedAdmin = await Admin.findOne({
        $or: [{ email }, { mobileNo }]
    })

    if (!existedAdmin) {
        throw new ApiError(400, "admin is not present")
    }

    if (existedAdmin.secret !== secret) {
        throw new ApiError(401, " please enter correct secrete")
    }

    const { accessToken, refresToken } = await generateAccessAndRefreshToken(existedAdmin._id)

    const admin = await Admin.findById(existedAdmin._id).select("-refreshToken")

    const options = {
        httponly: true,
        secure: true
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refresToken, options)
        .json(new ApiResponse(
            200,
            {
                admin: admin, accessToken, refresToken
            },
            "logged in successfully"
        ))

})

const adminLogout = asyncHandeler(async( req, res) => {
    
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {new:true}
    )

    const options ={
        httponly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"admin logout successfully"))

})

const countTotalMeal = asyncHandeler(async(req,res)=>{
    const admin = await Admin.findById(req.admin?._id)

    if (!admin) {
        throw new ApiError(400,"only admin can access this page")
    }

    const totalMeal= await User.find({mealStatus:true});
  
    return res.status(200)
             .json(new ApiResponse(200,{totalMeal},"these students are available"))
  })

export {
    adminRegister,
    adminLogin,
    adminLogout,
    countTotalMeal
}