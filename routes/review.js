const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview,IsloggedIn,isReviewAuthor} = require("../middleware.js");
const reviewController = require("../Controller/review.js");

///post Route
router.post("/",IsloggedIn,validateReview , wrapAsync(reviewController.createReview));
//delete review route
router.delete("/:reviewId", IsloggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;