const { createReview, deleteReview } = require("../services/firestore");

module.exports.createReview = async (req, res) => {
  const listingId = req.params.id;
  const reviewId = await createReview(listingId, req.body.review, req.user);
  if (!reviewId) {
    req.flash("error", "Listing not found");
    return res.redirect("/listing");
  }

  req.flash("success", "Review added successfully");
  res.redirect(`/listing/${listingId}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await deleteReview(reviewId);

  req.flash("success", "Review deleted successfully");
  res.redirect(`/listing/${id}`);
};
