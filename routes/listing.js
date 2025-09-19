const express = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");

const router = express.Router();
const flash = require("connect-flash");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");





// ------------------ All listings
router.get(
  "/", validateListing,
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// ------------------ New listing form
router.get("/new", isLoggedin, (req, res) => {
  res.render("listings/new.ejs");
});


// ----show rout
//------------------------------to show all listings
router.get("/:id", wrapAsync( async (req, res, next)=>{
  const {id} = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews",
    populate: {
      path: "author",
    },
  }).populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listing");
    };
  console.log(listing);
  res.render("listings/show.ejs", {listing});
}));


// ------------------ Create new listing
router.post(
  "/",
  isLoggedin,
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing.image || req.body.listing.image.trim() === "") {
      delete req.body.listing.image;
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listing");
  })
);



// ------------------ Edit form
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listing");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

// ------------------ Update listing
router.put(
  "/:id",
  isLoggedin,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
   
    await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { runValidators: true }
    );
    req.flash("success", "Listing edited successfully");
    res.redirect(`/listing/${id}`);
  })
);

// ------------------ Delete listing
router.delete(
  "/:id",
  isLoggedin,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully");
    res.redirect("/listing");
  })
);

module.exports = router;
