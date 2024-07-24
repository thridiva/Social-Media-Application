const express = require("express");
const authController = require("../controllers/authController");
const interactionsController = require("./../controllers/interactionsController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(interactionsController.getInteractions)
  .post(
    interactionsController.setPostUserId,
    interactionsController.createInteraction
  );

// router.route("/").post(interactionController.)
module.exports = router;
