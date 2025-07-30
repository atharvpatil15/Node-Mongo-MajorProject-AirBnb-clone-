const express = require("express");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const flash = require("connect-flash");
const passport = require("passport");


router.get("/signup", async (req, res) => {
  res.render("user/signup.ejs");
});

router.post("/signup",wrapAsync( async (req, res) => {

    try{
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        req.flash("success", "User registerd successfully");
        res.redirect("/listing");
        console.log(registerUser);
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }

 
}));

router.get("/login", (req, res)=>{
    res.render("user/login.ejs");
});

router.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    async (req, res)=> {
        req.flash("success", "You are logged in successfully");
      res.redirect("/listing");
    });



module.exports = router;
