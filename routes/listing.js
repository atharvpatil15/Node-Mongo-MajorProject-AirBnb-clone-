const express = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")
const {listingSchema, reviewSchema} = require("../schema.js");
const router = express.Router();

function validateListing(req, res, next){
    let {error} = listingSchema.validate(req.body);
    console.log(error);
    if(error){
      throw new ExpressError(400, error);
  };
  next();
  };


  router.get("/",  wrapAsync( async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
  }));
  
  
  // ---------------------------New listing form
  router.get("/new" , wrapAsync( async (req, res, next)=>{
      res.render("listings/new.ejs");
  }));
  
  // -------------------------------------Create new listing
  router.post("/",validateListing,wrapAsync( async (req, res, next)=>{
    //logic for default img link
  
    
  
    if (!req.body.listing.image || req.body.listing.image.trim() === "") {
      delete req.body.listing.image; 
    }
  
  
    const newListing = new Listing(req.body.listing);
    console.log("new listing is:", newListing);
  
    await newListing.save(); 
    res.redirect("/listing");
  }));
  
  // -----------------------------------Edit form 
  router.get("/:id/edit", wrapAsync( async (req, res, next)=>{
      const {id} = req.params;
      const listing = await Listing.findById(id);
      res.render("listings/edit.ejs", {listing});
  }));
  
  //------------------------------- Update listing
  router.put("/:id",validateListing,wrapAsync( async(req, res, next)=>{
      const {id} = req.params;
      await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
      res.redirect(`/listing`)
  }));
  
  // ---------------------------------Delete listing
  router.delete("/:id",wrapAsync( async (req, res, next)=>{
      const {id} = req.params;
      console.log("the id of deleted item is ",id);
      let deletedListing =  await Listing.findByIdAndDelete(id);
      console.log(deletedListing);
      res.redirect("/listing");
  }));

  module.exports = router;
