const { db, Timestamp } = require("../utils/firebase");

const listingsCollection = db.collection("listings");
const reviewsCollection = db.collection("reviews");
const usersCollection = db.collection("users");

function serializeTimestamp(value) {
  if (value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
}

function mapUser(doc) {
  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  return {
    _id: doc.id,
    email: data.email,
    phone: data.phone || "",
    username: data.username,
    createdAt: serializeTimestamp(data.createdAt),
  };
}

function mapReview(doc) {
  const data = doc.data();
  return {
    _id: doc.id,
    comment: data.comment,
    rating: data.rating,
    createdAt: serializeTimestamp(data.createdAt),
    listingId: data.listingId,
    author: data.author,
  };
}

function mapListing(doc) {
  const data = doc.data();
  return {
    _id: doc.id,
    title: data.title,
    description: data.description,
    image: data.image || { url: "", filename: "" },
    price: data.price,
    location: data.location,
    country: data.country,
    owner: data.owner || null,
    geometry: data.geometry || null,
    createdAt: serializeTimestamp(data.createdAt),
    reviews: [],
  };
}

async function listListings() {
  const snapshot = await listingsCollection.orderBy("createdAt", "desc").get();
  return snapshot.docs.map(mapListing);
}

async function getListingById(id) {
  const listingDoc = await listingsCollection.doc(id).get();
  if (!listingDoc.exists) {
    return null;
  }

  const listing = mapListing(listingDoc);
  if (listing.owner && listing.owner._id && !listing.owner.phone) {
    const ownerProfile = await getUserProfile(listing.owner._id);
    if (ownerProfile && ownerProfile.phone) {
      listing.owner.phone = ownerProfile.phone;
      await listingsCollection.doc(id).update({
        owner: {
          ...listing.owner,
          phone: ownerProfile.phone,
        },
      });
    }
  }

  const reviewsSnapshot = await reviewsCollection.where("listingId", "==", id).get();

  listing.reviews = reviewsSnapshot.docs
    .map(mapReview)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return listing;
}

async function createListing(listingData, image, geometry, currentUser) {
  const payload = {
    ...listingData,
    price: Number(listingData.price),
    image: image || { url: "", filename: "" },
    geometry: geometry || null,
    owner: {
      _id: currentUser._id,
      email: currentUser.email,
      phone: currentUser.phone || "",
      username: currentUser.username,
    },
    createdAt: Timestamp.now(),
  };

  const docRef = await listingsCollection.add(payload);
  return docRef.id;
}

async function updateListing(id, listingData, image, geometry) {
  const listingRef = listingsCollection.doc(id);
  const listingDoc = await listingRef.get();
  if (!listingDoc.exists) {
    return null;
  }

  const currentListing = listingDoc.data();
  const payload = {
    ...listingData,
    price: Number(listingData.price),
    image: image || currentListing.image || { url: "", filename: "" },
    geometry: geometry || currentListing.geometry || null,
  };

  await listingRef.update(payload);
  return id;
}

async function deleteListing(id) {
  const reviewsSnapshot = await reviewsCollection.where("listingId", "==", id).get();
  const batch = db.batch();

  reviewsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(listingsCollection.doc(id));

  await batch.commit();
}

async function createReview(listingId, reviewData, currentUser) {
  const listingDoc = await listingsCollection.doc(listingId).get();
  if (!listingDoc.exists) {
    return null;
  }

  const reviewRef = await reviewsCollection.add({
    listingId,
    comment: reviewData.comment,
    rating: Number(reviewData.rating),
    createdAt: Timestamp.now(),
    author: {
      _id: currentUser._id,
      email: currentUser.email,
      username: currentUser.username,
    },
  });

  return reviewRef.id;
}

async function getReviewById(reviewId) {
  const doc = await reviewsCollection.doc(reviewId).get();
  if (!doc.exists) {
    return null;
  }
  return mapReview(doc);
}

async function deleteReview(reviewId) {
  await reviewsCollection.doc(reviewId).delete();
}

async function createUserProfile(uid, data) {
  const payload = {
    email: data.email,
    phone: data.phone || "",
    username: data.username,
    createdAt: Timestamp.now(),
  };

  await usersCollection.doc(uid).set(payload);
  return {
    _id: uid,
    email: payload.email,
    phone: payload.phone,
    username: payload.username,
  };
}

async function upsertUserProfile(uid, data) {
  const userRef = usersCollection.doc(uid);
  const existingDoc = await userRef.get();
  const existingData = existingDoc.exists ? existingDoc.data() : {};

  const payload = {
    email: data.email || existingData.email || "",
    phone: data.phone || existingData.phone || "",
    username: data.username || existingData.username || "user",
    createdAt: existingData.createdAt || Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await userRef.set(payload, { merge: true });
  return {
    _id: uid,
    email: payload.email,
    phone: payload.phone,
    username: payload.username,
    createdAt: serializeTimestamp(payload.createdAt),
  };
}

async function getUserProfile(uid) {
  const doc = await usersCollection.doc(uid).get();
  return mapUser(doc);
}

async function updateListingMetadata(id, updates) {
  await listingsCollection.doc(id).update(updates);
}

module.exports = {
  listListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  createReview,
  getReviewById,
  deleteReview,
  createUserProfile,
  upsertUserProfile,
  getUserProfile,
  updateListingMetadata,
};
