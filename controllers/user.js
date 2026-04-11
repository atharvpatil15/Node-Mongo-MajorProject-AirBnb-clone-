const {
  signUpUser,
  signInUser,
  signInWithGoogle,
} = require("../services/firebaseAuth");

module.exports.renderSignupForm =  async (req, res) => {
  res.render("user/signup.ejs", { authPage: true });
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, phone } = req.body;
    if (!phone) {
      req.flash("error", "Phone number is required");
      return req.session.save((saveErr) => {
        if (saveErr) {
          return next(saveErr);
        }
        return res.redirect("/signup");
      });
    }
    const user = await signUpUser({ username, email, password, phone });
    req.session.user = user;
    req.flash("success", "welcome to airbnb you are loggedin!");
    return req.session.save((saveErr) => {
      if (saveErr) {
        return next(saveErr);
      }
      return res.redirect("/listing");
    });
  } catch (e) {
    req.flash("error", e.code || e.message);
    return req.session.save((saveErr) => {
      if (saveErr) {
        return next(saveErr);
      }
      return res.redirect("/signup");
    });
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("user/login.ejs", { authPage: true });
};

module.exports.login = (req, res, next) => {
  const { email, password, phone } = req.body;

  if (!email || !password || !phone) {
    req.flash("error", "Email, password and phone number are required");
    return req.session.save((saveErr) => {
      if (saveErr) {
        return next(saveErr);
      }
      return res.redirect("/login");
    });
  }

  signInUser({ email, password, phone })
    .then((user) => {
      req.session.user = user;
      req.flash("success", "You are logged in successfully");
      const redirectUrl = res.locals.redirectUrl || "/listing";
      delete req.session.redirectUrl;
      return req.session.save((saveErr) => {
        if (saveErr) {
          return next(saveErr);
        }
        return res.redirect(redirectUrl);
      });
    })
    .catch((error) => {
      req.flash("error", error.code || "Invalid email or password");
      return req.session.save((saveErr) => {
        if (saveErr) {
          return next(saveErr);
        }
        return res.redirect("/login");
      });
    });
};

module.exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken, phone } = req.body;
    const user = await signInWithGoogle(idToken, phone);
    req.session.user = user;
    req.flash("success", "You are logged in successfully");

    const redirectUrl = req.session.redirectUrl || "/listing";
    delete req.session.redirectUrl;

    return req.session.save((saveErr) => {
      if (saveErr) {
        return next(saveErr);
      }
      return res.json({ redirectUrl });
    });
  } catch (error) {
    const statusCode =
      error.code === "MISSING_GOOGLE_ID_TOKEN" || error.code === "PHONE_REQUIRED"
        ? 400
        : 401;
    req.flash("error", error.code || error.message || "Google sign-in failed");
    return req.session.save((saveErr) => {
      if (saveErr) {
        return next(saveErr);
      }
      return res.status(statusCode).json({
        error: error.code || error.message || "Google sign-in failed",
      });
    });
  }
};

module.exports.logout = (req, res, next) => {
  req.session.user = null;
  req.flash("success", "You are logged out!");
  req.session.save((saveErr) => {
    if (saveErr) {
      return next(saveErr);
    }
    return req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return next(destroyErr);
      }
      return res.redirect("/listing");
    });
  });
};
