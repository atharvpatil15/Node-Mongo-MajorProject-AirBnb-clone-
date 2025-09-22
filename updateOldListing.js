const mongoose = require("mongoose");
const Listing = require("./models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

// Make sure to load your environment variables
require('dotenv').config();

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

async function updateOldListings() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/airBnb");
        console.log("Connected to database");

        // Find listings without geometry
        const listingsWithoutGeometry = await Listing.find({
            $or: [
                { geometry: { $exists: false } },
                { "geometry.coordinates": { $exists: false } }
            ]
        });

        console.log(`Found ${listingsWithoutGeometry.length} listings without coordinates`);

        for (let listing of listingsWithoutGeometry) {
            try {
                console.log(`Updating listing: ${listing.title} in ${listing.location}`);
                
                let response = await geocodingClient.forwardGeocode({
                    query: `${listing.location}, ${listing.country}`,
                    limit: 1
                }).send();

                if (response.body.features.length > 0) {
                    listing.geometry = response.body.features[0].geometry;
                    await listing.save();
                    console.log(`✓ Updated: ${listing.title}`);
                } else {
                    console.log(`✗ No coordinates found for: ${listing.title}`);
                }
                
                // Add delay to respect API rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.error(`Error updating ${listing.title}:`, error.message);
            }
        }

        console.log("Update complete!");
        process.exit(0);
    } catch (error) {
        console.error("Script error:", error);
        process.exit(1);
    }
}

updateOldListings();