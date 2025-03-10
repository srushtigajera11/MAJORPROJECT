const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../Controller/user.js");

router.route("/signup")
    .get(userController.signupForm)
    .post(wrapAsync(userController.signup));
router.route("/login")
    .get(saveRedirectUrl,userController.loginForm)
    .post(passport.authenticate("local" , {faliureRedirect : '/login' , failureFlash:true}),userController.login);

router.get("/logout", userController.logout);
 
router.route("/forgot-password")
    .get(userController.renderForgotPasswordForm)  // ✅ Chained correctly
    .post(wrapAsync(userController.handleForgotPassword));

// Reset Password
router.route("/reset-password/:token")
    .get(userController.renderResetPasswordForm)
    .post(wrapAsync(userController.handleResetPassword));

module.exports = router;
