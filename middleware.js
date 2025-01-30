const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const {listingSchema } = require("./schema.js");
const {reviewSchema} = require("./schema.js");

module.exports.IsloggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in first");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl =  req.session.redirectUrl;   
    }
    next();
};
module.exports.isOwner = async (req, res, next) => {

        const { id } = req.params;
        const listing = await Listing.findById(id);
        // Ensure req.user exists and check ownership
        if (!req.user || !listing.owner.equals(res.locals.currentUser._id)) {
            req.flash("error", "You do not have permission to do that!");
            return res.redirect(`/listing/${id}`);
        }

        next();
};

module.exports.isReviewAuthor = async (req, res, next) => {

    const { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);
    // Ensure req.user exists and check ownership
    if (!req.user || !review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listing/${id}`);
    }

    next();
};



 module.exports.validatelisting = ((req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
});

module.exports.validateReview = (req, res, next) => {
    // If body is completely empty (e.g., form submitted without fields)
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ExpressError(400, "Request body is missing!");
    }

    // If "review" object is missing from the form data
    if (!req.body.review) {
        throw new ExpressError(400, "Review data is missing!");
    }

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};