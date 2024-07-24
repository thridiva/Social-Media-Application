const handleAsyncFunction = require("./../utils/handleAsyncFunction");
const factory = require("./handlerFactory");

const PostsModel = require("./../models/postsModel");
const AppError = require("../utils/appError");

exports.checkLoggedUser = async (req, res, next) => {
  if (req.user.role == "admin") return next();

  let postToBeUpdated = await PostsModel.findById(req.params.id);

  let postOwner = postToBeUpdated.userCreated.id.toString();

  let loggedUser = req.user._id.toString();

  // console.log(1 == 1);
  if (postOwner !== loggedUser) {
    return next(new AppError("You Dont Have access to update this post"));
  }
  next();
};

// --------------- CRUD Operations ---------------
// CRUD -> CREATE READ UPDATE DELETE

let optionsToAccept = ["name", "category", "description"];

// Create
exports.createOne = factory.createOne(PostsModel, optionsToAccept, true);

//Read
exports.getPosts = factory.getAll(PostsModel);

exports.getOnePost = factory.getOne(PostsModel, [
  {
    path: "interactions",
    select: "comment user",
  },
  { path: "userCreated", select: "-email -role profilePic" },
]);

// Update
exports.updatePost = factory.updateOne(PostsModel, optionsToAccept);

//Delete
exports.deletePost = factory.deleteOne(PostsModel);
