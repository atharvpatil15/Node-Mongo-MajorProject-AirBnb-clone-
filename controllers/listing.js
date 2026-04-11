const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const {
  listListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  updateListingMetadata,
  getUserProfile,
} = require("../services/firestore");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

function buildGeocodeQuery(listingInput) {
  return [listingInput.location, listingInput.country].filter(Boolean).join(", ");
}

function hasUsableGeometry(geometry) {
  const coordinates = geometry?.coordinates;
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every((value) => Number.isFinite(value)) &&
    !(coordinates[0] === 0 && coordinates[1] === 0)
  );
}

async function geocodeListingInput(listingInput) {
  const query = buildGeocodeQuery(listingInput);
  if (!query) {
    return null;
  }

  const response = await geocodingClient.forwardGeocode({
    query,
    limit: 1,
  }).send();

  return response.body.features[0]?.geometry || null;
}

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

  if (!hasUsableGeometry(listing.geometry)) {
    const geometry = await geocodeListingInput(listing);
    if (geometry) {
      listing.geometry = geometry;
      await updateListingMetadata(id, { geometry });
    }
  }

  let hostPhone = listing.owner?.phone || "";
  if (listing.owner?._id) {
    const ownerProfile = await getUserProfile(listing.owner._id);
    if (ownerProfile?.phone) {
      hostPhone = ownerProfile.phone;
      if (listing.owner.phone !== ownerProfile.phone) {
        listing.owner.phone = ownerProfile.phone;
        await updateListingMetadata(id, {
          owner: {
            ...listing.owner,
            phone: ownerProfile.phone,
          },
        });
      }
    }
  }

  res.render("listings/show.ejs", { listing, mapToken, hostPhone });
};

module.exports.createListing = async (req, res) => {
  const geometry = await geocodeListingInput(req.body.listing);
  const currentUser = await getUserProfile(req.user._id) || req.user;

  req.user = currentUser;
  req.session.user = currentUser;

  let url = req.file ? req.file.path : "";
  let filename = req.file ? req.file.filename : "";
  await createListing(
    req.body.listing,
    req.file ? { url, filename } : null,
    geometry,
    currentUser
  );
  req.flash("success", "New listing created");
  await new Promise((resolve, reject) => {
    req.session.save((saveErr) => {
      if (saveErr) {
        reject(saveErr);
        return;
      }
      resolve();
    });
  });
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

  if (req.body.listing.location || req.body.listing.country) {
    geometry = await geocodeListingInput(req.body.listing);
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
