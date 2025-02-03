
require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbUrl = process.env.ATLAS_URL;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter =   require("./routes/review.js");
const userRouter = require("./routes/user.js");
const staticRoutes = require("./routes/static"); // Import the static routes file


app.use(express.json()); 
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

main().then(()=>{
    console.log ("connected successful");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({ 
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
      },
    touchAfter: 24 * 3600,
});
store.on("error",function(e){
    console.log("session store error",e);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie  : {
        expires : Date.now() + 7 *24 *60 *60 *1000,
        maxAge :  7 *24 *60 *60 *1000 ,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/fakeuser",async (req,res)=>{
    const user = new User({
        email:"student232@gmail.com",
        username : "delta-student"
        });
    let registeruser = await User.register(user,"chicken");
    res.send(registeruser);
});

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

app.use("/listing",listingRouter);
app.use("/listing/:id/reviews",reviewsRouter);
app.use("/",userRouter);
app.use(staticRoutes);


app.all("*",(req,res,next)=>{
    next(new ExpressError(400,"page not found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500 , message= "something went wrong!" } = err;
    res.status(statusCode);
    res.render("error.ejs",{message});
   });
app.listen(8080,()=>{
    console.log("server is listening on port 8080");
});