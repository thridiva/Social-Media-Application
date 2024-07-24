const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const PostsModel = require("./postsModel");

// const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name Should Be Mentioned"],
      trim: true,
      maxlength: [
        40,
        "A Post must have a name with less or equal to 40 characters",
      ],
      minlength: [
        2,
        "A Post must have a name with more or equal to 2 characters",
      ],
    },
    about: {
      type: String,
      minlength: [2, "About Must Have atleast 2 characters"],
      maxlength: [40, "About Must Not Exceed 40 characters"],
      required: [true, "Add Some About You."],
    },
    userName: {
      unique: true,
      type: String,
      required: [true, "Username Should be there and unique"],
      validate: [
        validator.isAlpha,
        "Username Name should contain only characters",
      ],
    },
    profilePic: String,
    email: {
      type: String,
      unique: true,
      lower: true,
      required: [true, "Please Provide gmail"],
      validate: [validator.isEmail, "Email format is wrong"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Provide Password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Confirm Your Password"],
      validate: {
        // this works only on "create" and "save"
        validator: function (val) {
          // console.log(this.password, val);
          return this.password === val;
        },
        message: "Passwords Should Be Same",
      },
    },
    lastPasswordChangeAt: Date,
    encryptedResetToken: String,
    resetTokenExpiresAt: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", function (next) {
  this.profilePic = `https://robohash.org/${this.userName}`;
  // console.log(this, "came from this");
  next();
});

// userSchema.pre("save",)
userSchema.pre("save", async function (next) {
  //Only Run if password was modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  //Delete passwordConfirm as password was encrypted
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.lastPasswordChangeAt = Date.now() - 1000;
  next();
});

userSchema.virtual("interactions", {
  ref: "Interaction",
  foreignField: "user", // field name in Interaction Model
  localField: "_id",
});

userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "userCreated", // field name in Interaction Model
  localField: "_id",
});

// userSchema.pre(/^find/, function (next) {
//   // this.find({ active: {$ne:false} });
//   this.find({ active: true });

//   next();
// });

// TODO ----------- Add Posts That User Created, His Interactions, Saves(like watch later),Post Number to this -----------

userSchema.methods.checkEnterdPassword = async function (
  recivedPassword,
  dataBasePassword
) {
  return await bcrypt.compare(recivedPassword, dataBasePassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.lastPasswordChangeAt) {
    const changedTimeStamp = this.lastPasswordChangeAt.getTime();
    return changedTimeStamp > jwtTimeStamp * 1000;
  }
  return false; // usally false that means password was not changed , if true then password was changed
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;

// userSchema.methods.createEncryptedResetToken = function () {
//   //Generate some random Token
//   const resetTokenNotEncrypted = crypto.randomBytes(32).toString("hex");

//   //Encrypt The Token, And Add to document
//   this.encryptedResetToken = crypto
//     .createHash("sha256")
//     .update(resetTokenNotEncrypted)
//     .digest("hex");

//   //Set Expirary Time (To Expire token) And Add to document
//   this.resetTokenExpiresAt = Date.now() + 15 * 60 * 100;

//   // console.log(
//   //   { resetTokenNotEncrypted },
//   //   this.encryptedResetToken,
//   //   this.resetTokenExpiresAt
//   // );

//   return resetTokenNotEncrypted;
// };
