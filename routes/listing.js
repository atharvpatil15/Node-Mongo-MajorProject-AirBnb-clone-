const express = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");

const router = express.Router();
const flash = require("connect-flash");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

// ------------------ All listings index route
router.route("/")
  .get(validateListing, wrapAsync(listingController.index))
  .post(isLoggedin,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing)
  );// ------------------ Create new listing

// ------------------ New listing form
router.get("/new", isLoggedin, listingController.renderNewListing);

router.route("/:id")
  .get(wrapAsync(listingController.showListing)) //------------------------------to show listings
  .put(
    isLoggedin,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing) // ------------------ Update listing
  )
  .delete(isLoggedin, isOwner, wrapAsync(listingController.deleteListing)); // ------------------ Delete listing

// ------------------ Edit form
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
