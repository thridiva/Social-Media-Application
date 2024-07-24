const mongoose = require("mongoose");
const PostsModel = require("./postsModel");

let interactionsSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      require: [true, "Comment Cannot Be Empty"],
      trim: true,
      minlength: [1, "A Comment name must have more or equal to 1 characters"],
    },

    createdAt: { type: Date, default: Date.now() },

    //Parent Referencing
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      require: [true, "Comment Must Belong To A Post"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "Comment Must Belong To A Post"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

interactionsSchema.pre(/^find/, function (next) {
  // If need populated post data also
  // this.populate({
  //   path: "user",
  //   select: "name",
  // }).populate({
  //   path: "post",
  //   select: "name",
  // });

  this.populate({
    path: "user",
    select: "name",
  });

  next();
});

interactionsSchema.statics.calcStars = async function (postId) {
  // this -> current model
  let stats = await this.aggregate([
    {
      $match: { post: postId }, // post -> in comments we can see we are storing postId(post), so that one
    },
    {
      $group: {
        _id: "$post",
        nStars: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await PostsModel.findByIdAndUpdate(postId, {
      stars: stats[0].nStars,
    });
  } else {
    await PostsModel.findByIdAndUpdate(postId, {
      stars: 0,
    });
  }
};

// interactionsSchema.index({ post: 1, user: 1 }, { unique: true });

interactionsSchema.post("save", function () {
  // console.log(this);
  this.constructor.calcStars(this.post);
});

// TODO interactionsSchema.pre(/^find/,function(next){

// })
interactionsSchema.post(/^findOneAnd/, async function (doc) {
  if (doc && doc.post) await doc.constructor.calcStars(doc.post);
});

const interactionModel = mongoose.model("Interaction", interactionsSchema);

module.exports = interactionModel;
