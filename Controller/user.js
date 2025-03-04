require("dotenv").config();
const User = require("../models/user.js"); 
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");


module.exports.signupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try{
        let{username,email,password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust");
            res.redirect("/listing");
        });
       
    }catch(e){
        res.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req,res)=>{
    req.flash("success","welcome back");
    const redirectUrl = res.locals.redirectUrl || "/listing";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listing");
    });
};


console.log("Email:", process.env.EMAIL_USER);
console.log("Password:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Use 587 if you prefer TLS
    secure: true, // True for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ TEST SMTP CONNECTION
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ SMTP Connection Error:", error);
    } else {
        console.log("✅ SMTP Server is ready to send emails!");
    }
});

// Render Forgot Password Form
module.exports.renderForgotPasswordForm = (req, res) => {
    res.render("users/forgetPwd", { 
        messages: { 
            error: req.flash("error"), 
            success: req.flash("success") 
        }
    });
};


// Handle Forgot Password Request
module.exports.handleForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("recieved forgot password req for email : ",email);

        const user = await User.findOne({ email });

        if (!user) {
            req.flash("error", "No account found with that email.");
            return res.redirect("/forgot-password");
        }

        // Generate Reset Token
        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
        await user.save();
        console.log("reset token generated : ",token);

        // Generate Reset Link
        const resetLink = `https://${req.headers.host}/reset-password/${token}`;
        console.log("reset link : ",resetLink);

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,   
            to: user.email,
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${resetLink}`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error(err);
                req.flash("error", "Error sending reset email.");
                return res.redirect("/forgot-password");
            }
            console.log("reset email sent successfully");
            req.flash("success", "Password reset link sent to your email.");
            res.redirect("/forgot-password");
        });

    } catch (error) {
        console.error("Error in forgot password:", error);
        req.flash("error", "Something went wrong. Try again.");
       return res.redirect("/forgot-password");
    }
};

// Render Reset Password Form
module.exports.renderResetPasswordForm = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
        req.flash("error", "Invalid or expired reset token.");
        return res.redirect("/forgot-password");
    }

    res.render("users/resetPwd", { token });
};

// Handle Reset Password Submission
module.exports.handleResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

        if (!user) {
            req.flash("error", "Invalid or expired reset token.");
            return res.redirect("/forgot-password");
        }

        // Hash New Password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash("success", "Password reset successful! You can now log in.");
        res.redirect("/login");

    } catch (error) {
        req.flash("error", "Something went wrong. Try again.");
        res.redirect("/forgot-password");
    }
};
