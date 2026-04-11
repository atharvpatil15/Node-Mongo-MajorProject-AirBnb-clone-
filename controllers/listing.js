const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const {
  listListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require("../services/firestore");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await listListings();
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewListing = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res)=>{
  const {id} = req.params;
  const listing = await getListingById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listing");
  };
  res.render("listings/show.ejs", {listing, mapToken});
};

module.exports.createListing = async (req, res) => {
  const response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  })
    .send();

  let url = req.file ? req.file.path : "";
  let filename = req.file ? req.file.filename : "";
  await createListing(
    req.body.listing,
    req.file ? { url, filename } : null,
    response.body.features[0]?.geometry || null,
    req.user
  );
  req.flash("success", "New listing created");
  res.redirect("/listing");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await getListingById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listing");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let geometry = null;

  if (req.body.listing.location) {
    const response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    }).send();
    geometry = response.body.features[0]?.geometry || null;
  }

  await updateListing(
    id,
    req.body.listing,
    typeof req.file !== "undefined" ? { url: req.file.path, filename: req.file.filename } : null,
    geometry
  );
  req.flash("success", "Listing edited successfully");
  res.redirect(`/listing/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await deleteListing(id);
  req.flash("success", "Listing deleted successfully");
  res.redirect("/listing");
};
