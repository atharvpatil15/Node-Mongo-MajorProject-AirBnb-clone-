const mongoose = require("mongoose");

const schema = mongoose.Schema;

const listingSchema = new schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://st3.depositphotos.com/1472772/14760/i/450/depositphotos_147602337-stock-photo-house-icon-3d-rendering.jpg"
      },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
