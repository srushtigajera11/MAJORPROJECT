const express = require("express");
const router = express.Router();
const listingController = require("../Controller/listing.js");

// Privacy Policy Route
router.get("/privacy", listingController.privacy);

// Terms & Conditions Route
router.get("/terms", listingController.terms);

module.exports = router;