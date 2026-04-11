if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const initData = require("./data.js");
const { db, Timestamp } = require("../utils/firebase");

const initDB = async () => {
  const batch = db.batch();
  const listingsCollection = db.collection("listings");
  const existingListings = await listingsCollection.get();
  existingListings.docs.forEach((doc) => batch.delete(doc.ref));

  initData.data.forEach((obj) => {
    const docRef = listingsCollection.doc();
    batch.set(docRef, {
      ...obj,
      owner: {
        _id: "seed-user",
        username: "seed-user",
        email: "seed@example.com",
      },
      image: {
        url: obj.image,
        filename: "listingimage",
      },
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      createdAt: Timestamp.now(),
    });
  });

  await batch.commit();
  console.log("data was initialized");
};

initDB().catch((err) => {
  console.error(err);
  process.exit(1);
});
