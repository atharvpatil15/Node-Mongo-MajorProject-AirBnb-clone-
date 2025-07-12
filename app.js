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
const {listingSchema} = require("./schema.js")

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
};

app.get("/", (req, res) => {
  res.send("root is working");
  console.log("ExpressError:", ExpressError);
console.log("Type of ExpressError:", typeof ExpressError);
});

// Index route - show all listings
app.get("/listing",  wrapAsync( async (req, res, next) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
}));


// New listing form
app.get("/listing/new" , wrapAsync( async (req, res, next)=>{
    res.render("listings/new.ejs");
}));

// Create new listing
app.post("/listing",validateListing,wrapAsync( async (req, res, next)=>{
  //logic for default img link

  

  if (!req.body.listing.image || req.body.listing.image.trim() === "") {
    delete req.body.listing.image; 
  }


  const newListing = new Listing(req.body.listing);
  console.log("new listing is:", newListing);

  await newListing.save(); 
  res.redirect("/listing");
}));

// Edit form 
app.get("/listing/:id/edit", wrapAsync( async (req, res, next)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// Update listing
app.put("/listing/:id",validateListing,wrapAsync( async(req, res, next)=>{
    const {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
    res.redirect(`/listing`)
}));

// Delete listing
app.delete("/listing/:id",wrapAsync( async (req, res, next)=>{
    const {id} = req.params;
    console.log("the id of deleted item is ",id);
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listing");
}));


app.get("/listing/:id", wrapAsync( async (req, res, next)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
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