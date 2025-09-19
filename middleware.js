const Listing = require("./models/listing");

const Review = require("./models/reviews");

const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedin = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you need to login first");
        return res.redirect("/login");
      }
      next();
};

module.exports.saveRedirectUrl = (req, res, next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner =async (req, res, next)=>{
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if(!listing.owner._id.equals(res.locals.currentUser._id)){
    req.flash("error", "you are not the owner of this listing");
    return res.redirect(`/listing/${id}`);
  }
  next();
};

module.exports.validateListing=(req, res, next)=>{
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  }
  next();
};

module.exports.validateReview=(req, res, next)=>{
  let {error} = reviewSchema.validate(req.body);
  console.log(error);
  if(error){
    throw new ExpressError(400, error);
};
next();
};

module.exports.isReviewAuthor =async (req, res, next)=>{
  const { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currentUser._id)){
    req.flash("error", "you are not the author of this review");
    return res.redirect(`/listing/${id}`);
  }
  next();
};