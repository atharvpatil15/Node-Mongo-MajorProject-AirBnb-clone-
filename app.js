const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/airBnb";
const path = require("path");
const methodOverride = require("method-override");
ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");
const reviews = require("./models/reviews.js");

const listing = require("./routes/listing.js");
const review = require("./routes/review.js");

main()
  .then(() => {
    console.log("database is connected to airBnb");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

function validateListing(req, res, next){
  let {error} = listingSchema.validate(req.body);
  console.log(error);
  if(error){
    throw new ExpressError(400, error);
};
next();
};

function validateReview(req, res, next){
  let {error} = reviewSchema.validate(req.body);
  console.log(error);
  if(error){
    throw new ExpressError(400, error);
};
next();
};

app.get("/", (req, res) => {
  res.send("root is working");
  console.log("ExpressError:", ExpressError);
console.log("Type of ExpressError:", typeof ExpressError);
});



//-------------

app.use("/listing", listing);
app.use("/listing/:id/review", review)

//-------------


//--------------------- add reviews, POST request 




//------------------------------to show all listings
app.get("/listing/:id", wrapAsync( async (req, res, next)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("listings/show.ejs", {listing});
}));

// Catch all unmatched routes

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "page not found!"));
});


app.use((err, req, res, next) => {
 let{ statusCode=500, message="something went wrong" } = err;
 res.status(statusCode).render("error.ejs",{message,statusCode});
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});