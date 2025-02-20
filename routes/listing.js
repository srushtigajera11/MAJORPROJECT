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

 //search route 
 router.get("/search", wrapAsync(listingController.search));
 
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


 module.exports = router;