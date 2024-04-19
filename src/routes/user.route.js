import { Router } from 'express'
import { upload } from '../middlewares/multer.model.js'
import {
    loginUser,
    registerUser,
    verifyUser,
    getAllUnverifiedUser, getAllVerifiedUser,
    logoutUser,
    offYourMeal,
    getCurrentUser,
    deleteUser,
    changePassword,
    onYourMeal
} from '../controllers/user.controller.js'

import { verifyJWT } from "../middlewares/userVerifyjwt.js"
import {adminVerifyJWT} from "../middlewares/adminVerifyjwt.js"

const router = Router();

router.route("/register").post(
    upload.single('avatar'),
    registerUser
)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/unverifieduser").get(getAllUnverifiedUser)

router.route("/verifieduser").get(getAllVerifiedUser)

router.route("/verifyuser/:userId").get(verifyUser)

router.route("/offYourMeal").post(verifyJWT, offYourMeal)

router.route("/onyourmeal").get(verifyJWT,onYourMeal)

router.route("/getCurrentUser").post(verifyJWT,getCurrentUser)

router.route("/deleteUser/:userId").post(adminVerifyJWT,deleteUser)

router.route("/changePassword").post(verifyJWT,changePassword)

export default router;