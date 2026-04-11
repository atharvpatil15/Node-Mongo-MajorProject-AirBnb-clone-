const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const { getListingById, getReviewById } = require("./services/firestore");

module.exports.isLoggedin = (req, res, next) => {
  if (!req.session.user) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you need to login first");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let listing = await getListingById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listing");
  }
  if (!res.locals.currentUser || !listing.owner || listing.owner._id !== res.locals.currentUser._id) {
    req.flash("error", "you are not the owner of this listing");
    return res.redirect(`/listing/${id}`);
  }
  next();
};

module.exports.isNotListingOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await getListingById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listing");
  }

  if (
    res.locals.currentUser &&
    listing.owner &&
    listing.owner._id === res.locals.currentUser._id
  ) {
    req.flash("error", "Owners cannot review their own listings");
    return res.redirect(`/listing/${id}`);
  }

  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  console.log(error);
  if (error) {
    throw new ExpressError(400, error);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let review = await getReviewById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listing/${id}`);
  }
  if (!res.locals.currentUser || !review.author || review.author._id !== res.locals.currentUser._id) {
    req.flash("error", "you are not the author of this review");
    return res.redirect(`/listing/${id}`);
  }
  next();
};
