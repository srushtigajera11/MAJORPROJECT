const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { IsloggedIn,isOwner, validatelisting,} = require("../middleware.js"); 
const listingController = require("../Controller/listing.js");
const multer  = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({storage});

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        IsloggedIn,
        upload.single("listing[image]"),
        // validatelisting,
         wrapAsync(listingController.create));
    
    //new route
 router.get("/new", IsloggedIn,listingController.newForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.show))
    .put( upload.single("image")
    // , validatelisting
    , wrapAsync(listingController.update))
    .delete(wrapAsync(listingController.destroy));

 
 //edit route
 router.get("/:id/edit", 
    IsloggedIn,
    isOwner,
    wrapAsync( listingController.edit)
 );

 //search route 
 router.get("/search", wrapAsync(async (req, res) => {
 
       const { country } = req.query;
       if (!country) {
           return res.redirect("/listings");
       }

       // Fetch listings where 'country' matches the user input (case insensitive)
       const filteredListings = await Listing.find({
           country: { $regex: new RegExp(country, "i") }
       });

       res.render("listings/index", { allListing: filteredListings });
    
})
);
 module.exports = router;