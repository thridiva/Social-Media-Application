const express = require("express");
const authController = require("../controllers/authController");
const pagesController = require("./../controllers/pagesController");
const userController = require("./../controllers/userController");

const router = express.Router();

router.route("/").get(authController.isLoggedIn, pagesController.getMainPage);

router
  .route("/login")
  .get(
    authController.isLoggedIn,
    pagesController.checkLoggedIn,
    pagesController.getLoginForn
  );

router.get(
  "/signup",
  authController.isLoggedIn,
  pagesController.checkLoggedIn,
  pagesController.getSignupForm
);

router.route("/post/:id").get(authController.protect, pagesController.getPost);

router.route("/account").get(authController.protect, pagesController.account);

router.route("/latestPosts").get(pagesController.getLatestPosts);
router
  .route("/createPost")
  .get(authController.protect, pagesController.createPost);

router
  .route("/submit-form")
  .post(authController.protect, pagesController.updateUserData);
module.exports = router;
