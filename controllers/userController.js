const handleAsyncFunction = require("../utils/handleAsyncFunction");
const UserModel = require("./../models/userModel");

const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

let filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((curr) => {
    if (allowedFields.includes(curr)) {
      newObj[curr] = obj[curr];
    }
  });
  return newObj;
};

// --------------- CRUD Operations ---------------

// ------- Create -------
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not at defined! Please Use Signup Instead",
  });
};

// ------- Read -------
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// ------- Update -------
exports.updateMe = (req, res, next) =>
  handleAsyncFunction(
    async (req, res, next) => {
      if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            "This Route is not for password update, use /updatePassword",
            400
          )
        );
      }

      let allowedToChangeOptions = ["name", "email", "userName", "profilePic"];

      if (!allowedToChangeOptions.includes(...Object.keys(req.body))) {
        return next(
          new AppError(
            "Only These Can Be Changed; name, email, username, profilePic"
          )
        );
      }

      //Filter unwanted field names that are not allowed to update
      const filterdBody = filterObj(
        req.body,
        "name",
        "email",
        "userName",
        "profilePic"
      );

      //Update User
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user.id,
        filterdBody,
        {
          new: true,
          runValidators: true,
        }
      );

      // console.log(updatedUser);
      res.status(200).json({
        status: "success",
        data: {
          user: updatedUser,
        },
      });
    },
    req,
    res,
    next
  );

// ------- Delete -------
exports.deleteMe = (req, res, next) =>
  handleAsyncFunction(
    async (req, res, next) => {
      const user = await UserModel.findByIdAndUpdate(req.user.id, {
        active: false,
      });

      if (user.role == "admin") {
        return next(new AppError("Can't Delete Your Account! Contact Owner"));
      }

      // console.log(x);
      res.status(204).json({
        status: "success",
        message:
          "Account Deleted! If You Accidently deleted, You Can Request Your Account Back :)",
        data: null,
      });
    },
    req,
    res,
    next
  );

exports.requestAccount = (req, res, next) =>
  handleAsyncFunction(
    async (req, res, next) => {
      // console.log("came");
      if (req.user) {
        return next(
          new AppError(
            "You are already logged in, This path is to recover account, which was deleted by user"
          )
        );
      }
      const { email, password } = req.body;
      //check both email and password exits
      if (!email || !password) {
        return next(
          new AppError(
            `Please provide email and password, Check the input fields`
          ),
          400
        );
      }

      const user = await UserModel.findOne({ email }).select("+active");
      if (user.active) {
        return next(
          new AppError("Your Account is not Deleted, You can Login 🙄.")
        );
      }

      user.active = true;
      user.save({ validateBeforeSave: false });
      // console.log(user);
      // await UserModel.findByIdAndUpdate(, {
      //   active: true,
      // })
      // console.log(x);
      res.status(200).json({
        status: "success",
        message:
          "Your Request Accepted! Account Recoverd Successfully ✅. Login To Your Account",
      });
    },
    req,
    res,
    next
  );

// --------------- Admin Only Can Access ---------------

//only for admins
exports.getAllUsers = factory.getAll(UserModel); //Read

//only for admins
exports.getUser = factory.getOne(UserModel, [
  {
    path: "interactions",
  },
  {
    path: "posts",
  },
]); //Read

//Dont Update Passwords with this , and this is only for admins
// Admins Cant Change Users's Password

exports.updateUser = factory.updateOne(UserModel); //Update

// only for admins
exports.deleteUser = factory.deleteOne(UserModel); //Delete

// ------------------------------ Extra ------------------------------

// --------------- Route Handlers ---------------

// let getAllUsersFunction = async (req, res) => {
//   const users = await UserModel.find();

//   // --------------- Final Response ---------------

//   res.status(200).json({
//     status: "success",
//     requestedAt: req.requestTime,
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// };

// exports.getAllUsers = (req, res, next) =>
//   handleAsyncFunction(getAllUsersFunction, req, res, next);
