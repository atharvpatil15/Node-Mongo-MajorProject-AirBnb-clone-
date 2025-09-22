const express = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const router = express.Router({ mergeParams: true });

const reviews = require("../models/reviews.js");
const {
  validateReview,
  isLoggedin,
  isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

// -----------------create/adding new review

router.post(
  "/",
  validateReview,
  isLoggedin,
  wrapAsync(reviewController.createReview)
);

//--------------to delete the reviews

router.delete(
  "/:reviewId",
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
