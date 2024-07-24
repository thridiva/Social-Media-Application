const factory = require("./handlerFactory");
const InteractionModel = require("./../models/interactionModel");

exports.setPostUserId = (req, res, next) => {
  if (!req.body.postId) req.body.post = req.params.postId;
  req.body.user = req.user;
  next();
};

// --------------- CRUD Operations ---------------

// let optionsToAccept = ["comment"];

exports.createInteraction = factory.createOne(
  InteractionModel,
  false,
  false,
  false
);

exports.getInteractions = factory.getAll(InteractionModel);
