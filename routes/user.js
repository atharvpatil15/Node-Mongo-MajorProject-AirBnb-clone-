const express = require("express");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const flash = require("connect-flash");
const passport = require("passport");
const { isLoggedin, saveRedirectUrl } = require("../middleware.js");


router.get("/signup", async (req, res) => {
  res.render("user/signup.ejs");
});

router.post("/signup",wrapAsync( async (req, res) => {

    try{
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.login(registerUser, (err) =>{
            if(err){
                return next(err);
            }
            req.flash("success", "welcome to airbnb you are loggedin!");
            
            res.redirect("/listing");
           
        });
        
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }

 
}));

router.get("/login", (req, res)=>{
    res.render("user/login.ejs");
});

router.post('/login', saveRedirectUrl, 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    async (req, res)=> {
        req.flash("success", "You are logged in successfully");
        let redirectUrl = res.locals.redirectUrl || "/listing";
        res.redirect(redirectUrl);
    });


router.get("/logout",(req, res, next) => {
  console.log("Logout route hit!");
  req.logOut((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listing");
  });
});

module.exports = router;
