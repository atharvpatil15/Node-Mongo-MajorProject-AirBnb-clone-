const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router({ mergeParams: true });

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
