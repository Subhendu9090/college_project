import { Router } from 'express'
import { upload } from '../middlewares/multer.model.js'
import {adminRegister,adminLogin,adminLogout,countTotalMeal} from '../controllers/admin.controller.js'
import {adminVerifyJWT} from '../middlewares/adminVerifyjwt.js'

const router=Router()

router.route("/register").post(adminRegister)
router.route("/login").post(adminLogin)
router.route("/logout").post(adminVerifyJWT,adminLogout)
router.route("/counttotalmeal").get(adminVerifyJWT,countTotalMeal)

export default router