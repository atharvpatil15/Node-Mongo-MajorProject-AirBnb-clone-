if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");
require("./utils/firebase");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const secret = process.env.SECRET;

if (!secret) {
  if (process.env.NODE_ENV === "production") {
    console.error("CRITICAL: Missing required environment variables.");
  }
}

// App Settings
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: secret || "fallbacksecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  req.user = req.session.user || null;
  req.isAuthenticated = () => Boolean(req.session.user);
  next();
});

// Locals Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.session.user || null;
  res.locals.authPage = false;
  res.locals.firebaseClientConfig = {
    apiKey: process.env.FIREBASE_WEB_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.FIREBASE_PROJECT_ID || "",
  };
  next();
});

// Routes
app.use("/listing", listingRouter);
app.use("/listing/:id/review", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.redirect("/listing");
});

// Error Handling
app.all("*path", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const { statusCode = 500, message = "Something went wrong" } = err;
  console.error("Error Middleware:", err);
  res.status(statusCode).render("error.ejs", { message, statusCode });
});

function logProcessEvent(eventName, error) {
  console.error(`[process:${eventName}]`, error || "");
}

let server;

function shutdown(signal) {
  console.error(`[process:${signal}] Server interrupted`);

  if (!server) {
    process.exit(0);
    return;
  }

  server.close((error) => {
    if (error) {
      console.error("[server:close:error]", error);
      process.exit(1);
      return;
    }
    process.exit(0);
  });
}

process.on("uncaughtException", (error) => {
  logProcessEvent("uncaughtException", error);
});

process.on("unhandledRejection", (error) => {
  logProcessEvent("unhandledRejection", error);
});

process.on("exit", (code) => {
  console.error(`[process:exit] code=${code}`);
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

// Start HTTP server when running as a standalone Node process.
// On Vercel, the app must be exported without calling listen().
const port = process.env.PORT || 8080;
const shouldStartServer = !process.env.VERCEL;

if (shouldStartServer) {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("[server:error]", error);
  });

  server.on("close", () => {
    console.error("[server:close] HTTP server closed");
  });
}

module.exports = app;
