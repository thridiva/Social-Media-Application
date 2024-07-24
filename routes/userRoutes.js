const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// ---------------- Basic Operations ----------------

router.get("/isLoggedIn", authController.isLoggedIn);

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.post("/requestAccount", userController.requestAccount);

router.get("/isLoggedIn", authController.isLoggedIn);

// router.post("/forgotPassword", authController.forgotPassword);

// router.patch("/resetPassword/:token", authController.resetPassword);

// --------------- Protected All Routes ---------------

router.use(authController.protect);

// Its Like Extra Protection
// router.use(authController.isUserDefined);

router.get("/logout", authController.logout);
// router.patch("/updatePassword", authController.updatePassword); // changing password so patch (update)

router.get("/me", userController.getMe, userController.getUser);

router.patch("/updateMe", authController.protect, userController.updateMe);

router.delete("/deleteMe", userController.deleteMe, authController.logout);

// --------------- Protected To Admins Only---------------

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
