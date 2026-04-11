const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup)); //----signup

router.route("/login")
  .get(userController.renderLoginForm)
  .post(saveRedirectUrl, userController.login);

router.post("/auth/google", wrapAsync(userController.googleAuth));

//---logout
router.get("/logout", userController.logout);

module.exports = router;
