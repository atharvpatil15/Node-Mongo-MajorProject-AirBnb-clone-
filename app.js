if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
  
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dburl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/airBnb";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


main()
  .then(() => {
    console.log("database is connected to airBnb");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dburl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: dburl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error", (err)=>{
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOption = {
  // store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7*24*60*60*1000 ,
    maxAge: 7*24*60*60*1000 ,
    httpOnly: true
  },
};

app.use(session(sessionOption));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/listing", listingRouter);
app.use("/listing/:id/review", reviewRouter);
app.use("/", userRouter);


app.get("/", (req, res) => {
  res.redirect("/listing");
});

// Catch all unmatched routes
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "page not found!"));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  let{ statusCode=500, message="something went wrong" } = err;
  res.status(statusCode).render("error.ejs",{message,statusCode});
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

module.exports = app;