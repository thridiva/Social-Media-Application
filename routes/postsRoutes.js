const express = require("express");
const postsController = require("../controllers/postsController");
const authController = require("./../controllers/authController");
const interactionsRouter = require("./interactionsRouters");

const router = express.Router();

router.route("/").get(postsController.getPosts);

// --- Protected Routes ---

router.use(authController.protect);
router.use(authController.isUserDefined);

router
  .route("/:id")
  .get(postsController.getOnePost)
  .delete(postsController.checkLoggedUser, postsController.deletePost);

router.use("/:postId/comment", interactionsRouter);

router.route("/createPost").post(postsController.createOne);

router
  .route("/updatePost/:id")
  .patch(postsController.checkLoggedUser, postsController.updatePost);

module.exports = router;
