const mongoose = require("mongoose");
// const validator = require("validator");

const postsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Post name Should Be Mentioned"],
      trim: true,
      maxlength: [40, "A Post name must have less or equal to 40 characters"],
      minlength: [2, "A Post name must have more or equal to 2 characters"],
    },
    stars: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: "unknown",
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Must Have Some Description"],
    },
    deletedPost: {
      type: Boolean,
      default: false,
    },
    userCreated: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A post must be created by user "],
    },
    dateUploaded: {
      type: Date,
      default: Date.now(),
      // default: () =>
      //   new Date(Date.now() - new Date().getTimezoneOffset() * 60000),
    },
    // images: [String], // Will Be Updated Soon
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postsSchema.index({ stars: 1 });

//----------------- Virtual Populate -----------------
postsSchema.virtual("interactions", {
  ref: "Interaction",
  foreignField: "post", // field name in Interaction Model
  localField: "_id",
});

postsSchema.pre(/^find/, function (next) {
  this.find({ deletedPost: { $ne: true } });
  this.populate({
    path: "userCreated",
    select: "-email -__v",
  });
  // console.log(this);
  next();
});

const PostsModel = mongoose.model("Post", postsSchema);

module.exports = PostsModel;
