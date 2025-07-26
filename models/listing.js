const mongoose = require("mongoose");
const Review = require("./reviews.js");

const schema = mongoose.Schema;

const listingSchema = new schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default:
      "https://st3.depositphotos.com/1472772/14760/i/450/depositphotos_147602337-stock-photo-house-icon-3d-rendering.jpg",
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [1, "Price must be at least ₹1"],
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  },
  reviews: [
    {
      type: schema.Types.ObjectId,
      ref: "Review"
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing)=>{
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
