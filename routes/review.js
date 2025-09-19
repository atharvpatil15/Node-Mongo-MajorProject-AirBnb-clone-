const express = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")
const {listingSchema, reviewSchema} = require("../schema.js");
const router = express.Router({mergeParams: true});
const Review = require("../models/reviews.js");
const reviews = require("../models/reviews.js");
const { validateReview, isLoggedin, isReviewAuthor} = require("../middleware.js");
 

  router.post("/", validateReview,isLoggedin, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
  
    console.log("newReview before save:", newReview);
  
    await newReview.save();
    console.log("newReview after save:", newReview);
  
    
    listing.reviews.push(newReview);
    await listing.save();
    
    console.log("Review added to listing:", listing._id);
    req.flash("success", "Review added succesfully");
    res.redirect(`/listing/${listing._id}`);
  }));
  
  //--------------to delete the reviews
  
  router.delete("/:reviewId",isLoggedin,isReviewAuthor, wrapAsync(async (req, res)=>{
  
  let{id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted succesfully");
  res.redirect(`/listing/${id}`);
  
  }))

  module.exports = router;