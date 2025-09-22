const User = require("../models/user.js");

module.exports.renderSignupForm =  async (req, res) => {
    res.render("user/signup.ejs");
};

module.exports.signup = async (req, res) => {

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

 
};

module.exports.renderLoginForm =  (req, res)=>{
    res.render("user/login.ejs");
};

module.exports.login = async (req, res)=> {
    req.flash("success", "You are logged in successfully");
    let redirectUrl = res.locals.redirectUrl || "/listing";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    console.log("Logout route hit!");
    req.logOut((err) => {
      if (err) return next(err);
      req.flash("success", "You are logged out!");
      res.redirect("/listing");
    });
};