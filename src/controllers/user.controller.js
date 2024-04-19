import { asyncHandeler } from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { isValidObjectId } from "mongoose"

const accessRefreshTokenGenerator = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken()

        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        console.log(error);
        throw new ApiError(400, "token generation faild")
    }
}

const registerUser = asyncHandeler(async (req, res) => {
    // get the required field from frontend
    // check for empty
    // check for existance
    // get avatar from req.file
    // then upload to cloudinary
    // check for url return by cloudinary
    // create user 
    // remove password and refreshToken
    // send res
    const { fullname, rollNo, registrationNo, email, password, hostelname } = req.body

    if ([fullname, rollNo, registrationNo, email, password, hostelname].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existeduser = await User.findOne({
        $or: [{ rollNo }, { registrationNo }]
    })

    if (existeduser) {
        throw new ApiError(400, "user is already exist");
    }

    const avtarLocalPath = req.file?.path
    if (!avtarLocalPath) {
        throw new ApiError(400, " avatar path is not found")
    }
    const avtar = await uploadOnCloudinary(avtarLocalPath)

    if (!avtar) {
        throw new ApiError(400, " avatar url is missing")
    }
    const user = await User.create({
        fullname,
        rollNo,
        registrationNo: registrationNo,
        email,
        password,
        hostel: hostelname,
        avatar: avtar.url,
        mealStatus: true,
        onMeal: 0,
        offMeal: 0,
        status: false,
        lastOffMealTime: null
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(201)
        .json(new ApiResponse(200, createdUser, "you are successfully registered"))
})

const loginUser = asyncHandeler(async (req, res) => {
    const { rollNo, registrationNo, password } = req.body

    if (!(rollNo || registrationNo)) {
        throw new ApiError(400, "please enter valid credentials")
    }
    const user = await User.findOne({
        $or: [{ rollNo }, { registrationNo }]
    })
    if (!user) {
        throw new ApiError(400, "user is not avalable")
    }

    const passwordCheck = await user.isPasswordCorrect(password)

    if (!passwordCheck) {
        throw new ApiError(401, "please enter correct password")
    }

    if (!user.status) {
        throw new ApiError(300, " you are not verified user so try to log in after some time")
    }
    const { accessToken, refreshToken } = await accessRefreshTokenGenerator(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httponly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user loggedin successfully"
        ));

})

const logoutUser = asyncHandeler(async (req, res) => {
    //console.log("id",req.user?._id);
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user successfully logged out"))
})

const getCurrentUser = asyncHandeler(async (req, res) => {
    res.status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "current user fetched successfully"
        ))
})

const getAllUnverifiedUser = asyncHandeler(async (req, res) => {
    const users = await User.find({ status: false })

    if (!users || users.length === 0) {
        throw new ApiError(400, "no user available of status false")
    }

    res.status(200)
        .json(new ApiResponse(200, users, "all status false user are fetched"))
})

const getAllVerifiedUser = asyncHandeler(async (req, res) => {
    const users = await User.find({ status: true })

    if (!users || users.length === 0) {
        throw new ApiError(400, "no user available of status false")
    }

    return res.status(200)
        .json(new ApiResponse(200, users, "all status false user are fetched"))
})

const verifyUser = asyncHandeler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, " userid is missing")
    }
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(400, "user is not found")
    }
    user.status = true;
    user.onMeal = 180;

    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, { userId }, "user is successfully added to the hostel"))

})

const deleteUser = asyncHandeler(async (req, res) => {
    const { id } = req.params
    if (!id?.trim()) {
        throw new ApiError(400, " Id is missing")
    }

    const user = await User.findOneAndDelete({ _id: id })

    if (!user) {
        throw new ApiError(400, "user not found")
    }

    return res.status(200)
        .json(new ApiResponse(200, "user is deleted"))

})

const changePassword = asyncHandeler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const passwordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!passwordCorrect) {
        throw new ApiError(401, "please enter correct password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password saved successfully"))
})

const offYourMeal = asyncHandeler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(400, "user is not login")
    }

    let user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(400, "user not found")
    }
    const now = Date.now();
    const lastOffMealTime = req.User?.lastOffMealTime || 0;
    const timeDiff = Math.abs(now - lastOffMealTime) / (1000 * 60 * 60);

    if (timeDiff >= 24) {
        user.offMeal += 1;
        user.lastOffMealTime = now;
        user.mealStatus = false;
        await user.save({ validateBeforeSave: false });

        return res.status(200)
            .json(new ApiResponse(200, { user }, "you off your meal successfully"))

    } else {
        throw new ApiError(400, " you can off your meal once in a day")
    }

})

const onYourMeal = asyncHandeler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(400, "please login to on your meal")
    }
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(400, "user not found")
    }
   
    user.mealStatus = true;
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, { user }, "meal is on successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getAllUnverifiedUser,
    getAllVerifiedUser,
    verifyUser,
    deleteUser,
    changePassword,
    offYourMeal,
    onYourMeal,
}