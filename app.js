const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/airBnb";
const path = require("path");
const methodOverride = require("method-override");
ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

const Listing = require("./models/listing.js");

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

app.get("/", (req, res) => {
  res.send("root is working");
});

app.get("/listing", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
});

app.get("/listing/new", (req, res)=>{
    res.render("listings/new.ejs");
})

app.post("/listing", async (req, res)=>{
  //logic for default img link
  if (!req.body.listing.image || req.body.listing.image.trim() === "") {
    delete req.body.listing.image; // let mongoose apply default
  }

  const newListing = new Listing(req.body.listing);
  console.log("new listing is:", newListing);

  await newListing.save(); // always await save
  res.redirect("/listing");

})

app.get("/listing/:id/edit", async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

app.get("/listing/:id", async (req, res)=>{
    const {id} = req.params;
    // console.log(id);
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/show.ejs", {listing});
})
app.put("/listing/:id", async(req, res)=>{
    const {id} = req.params;
   await  Listing.findByIdAndUpdate(id,{...req.body.listing})
   res.redirect(`/listing`)
})

app.delete("/listing/:id",async (req, res)=>{
    const {id} = req.params;
    console.log("the id of deleted item is ",id);
  let deletedListing =  await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
    res.redirect("/listing");
})
// app.get("/list", async (req, res) => {
// //     let newList = new Listing({
// //         title: "my home",
// //         description: "this is my home",
// //         price: 5000,
// //         location: "aurangabad",
// //         country: "India"
// //     });

// //    await newList.save()
// //     .then(savedListing => {
// //         console.log(savedListing);
// //         res.send("Listing saved!");
// //     })
// //     .catch(err => {
// //         console.log("The error is:", err);
// //         res.status(500).send("Error saving listing");
// //     });
// });

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});