const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

// const encdec = require("../utilities/encdec");

const UserModel = require("../models/userModel");
const handleAsyncFunction = require("../utils/handleAsyncFunction");
const AppError = require("../utils/appError");
const userModel = require("../models/userModel");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt_ak", token, cookieOptions);
  // localStorage.setItem("jwt_ak", token);

  user.password = undefined;
  // user.email = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const singUpFunction = async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    lastPasswordChangeAt: req.body.lastPasswordChangeAt,
    userName: req.body.userName,
    about: req.body.about,
  });

  if (req.body.role) return next(new AppError(" You cant set your role", 400));

  createSendToken(newUser, 201, res);
};

const loginFunction = async (req, res, next) => {
  const { email, password } = req.body;
  // console.log("came here");
  //check both email and password exits
  if (!email || !password) {
    return next(
      new AppError(`Please provide email and password, Check the input fields`),
      400
    );
  }
  // check if user exits && passwords is correct

  const user = await UserModel.findOne({ email })
    .select("+password")
    .select("+active");

  // let correct = await user.checkEnterdPassword(password, user.password);
  // console.log(user);

  if (!user || !(await user.checkEnterdPassword(password, user.password))) {
    res.cookie("jwt_ak", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.active) {
    return next(
      new AppError(
        "Account Has Been Deleted! If Need You Can Use /requestAccount path"
      )
    );
  }

  // //If User is inactive dont try to login

  // console.log(user);
  // console.log(user.active);
  // if (!user.active) {
  //   return next(
  //     new AppError(
  //       "Account Has been deleted, Reactivate Account Option Comming Soon!"
  //     )
  //   );
  // }

  // if everthing is ok, send token to client
  createSendToken(user, 200, res);

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
};

const protectFunction = async (req, res, next) => {
  try {
    let token;

    //Getting token and check if its valid
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt_ak) {
      // console.log("came");
      token = req.cookies.jwt_ak;
    }

    // console.log(token);

    if (!token) {
      return next(
        new AppError("You are not logged in! Please login to get access", 401)
      );
    }
    //Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //check user still exists
    const loggedUser = await UserModel.findById(decoded.id);
    // console.log(loggedUser);

    if (!loggedUser) {
      return next(
        new AppError("The User Belonging to this token does no longer exits!")
      );
    }

    //check if user changed password after the token issued

    if (loggedUser.changedPasswordAfter(decoded.iat)) {
      // console.log("came");
      return next(
        new AppError(
          "Password was recently changed, Please login with new Password",
          401
        )
      );
    }

    // if all checks have been passed then grant access to the protected route

    // loggedUser.email = undefined;
    req.user = loggedUser;

    res.locals.loggedUserName = loggedUser.name.split(" ")[0];
    res.locals.user = true;

    next();
  } catch (err) {
    return next(new AppError("Something went wrong, Try Login Again!!", 400));
  }
};

//Only For Render Pages
exports.isLoggedIn = async (req, res, next) => {
  //Getting token and check if its valid
  if (req.cookies.jwt_ak) {
    try {
      //Verification of token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt_ak,
        process.env.JWT_SECRET
      );
      // console.log(decoded);

      //check user still exists
      const loggedUser = await UserModel.findById(decoded.id);
      // console.log(loggedUser);

      if (!loggedUser) {
        return next();
      }

      //check if user changed password after the token issued

      if (loggedUser.changedPasswordAfter(decoded.iat)) {
        // console.log("came");
        return next();
      }

      // if all checks have been passed then there is a logged in user
      res.locals.user = true;
      res.locals.loggedUserName = loggedUser.name.split(" ")[0];

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

const logoutFunction = (req, res, next) => {
  // req.user = undefined;

  res.cookie("jwt_ak", "loggedout", {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });

  // localStorage.removeItem("jwt_ak");
  res.status(200).json({
    status: "success",
    message: "Logged Out",
  });
};

exports.logout = (req, res, next) =>
  handleAsyncFunction(logoutFunction, req, res, next);
// restrictTo -> Only those can access that route

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You Dont Have Access To Perform this action"),
        403
      );
    }

    next();
  };
};

// ---------------- *  ----------------

exports.signup = (req, res, next) =>
  handleAsyncFunction(singUpFunction, req, res, next);

exports.login = (req, res, next) =>
  handleAsyncFunction(loginFunction, req, res, next);

exports.protect = (req, res, next) =>
  handleAsyncFunction(protectFunction, req, res, next);

exports.isUserDefined = (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError("You are not logged in! Please login to get access", 401)
    );
  }
  next();
};
// ---------------- *  ----------------

// --- restrictTo -> Only those can access that route ---

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You Dont Have Access To Perform this action"),
        403
      );
    }

    next();
  };
};

// Logged User Can Directly Change Password

let updatePasswordFunction = async (req, res, next) => {
  //Get user from collection
  let user = await UserModel.findById(req.user.id).select("+password");

  // check if enterd password is correct
  let isthisCorrect = await user.checkEnterdPassword(
    req.body.currentPassword,
    user.password
  );
  if (!isthisCorrect) {
    return next(new AppError("Your Current Password is wrong", 400));
  }

  //If Correct then update the password
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError("Please Enter passwords field", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // UserModel.findByIdAndUpdate() this will not work because we need to ecnrypt the password

  // Log user in , send new JWT
  createSendToken(user, 200, res);

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
};

exports.updatePassword = (req, res, next) =>
  handleAsyncFunction(updatePasswordFunction, req, res, next);

// -------------- Extra [Forget Password, Reset Password] --------------

// exports.forgotPassword = async (req, res, next) => {
//   if (!req.body.email)
//     return next(
//       new AppError("Please Enter Email And Click Forgot Passoword"),
//       404
//     );

//   // Get user based on Posted Email
//   const user = await UserModel.findOne({ email: req.body.email });
//   // console.log(user);

//   //If No User Return Error
//   if (!user) {
//     return next(new AppError("There is no user with email address", 404));
//   }

//   // Generate the random Token (using method)
//   const resetTokenNotEncrypted = user.createEncryptedResetToken();

//   //In Method we were trying to edit user doc, so we have to save

//   await user.save({ validateBeforeSave: false }); // used validateBeforeSave because as we have taking only email as inp and saving token, so while saving validator checks like all fields available or not, So we are bypassing that validator to not check

//   // send it to user's email
//   const resetURL = `${req.protocol}://${req.get(
//     "host"
//   )}/api/v1/users/resetPassword/${resetTokenNotEncrypted}`;

//   const message = `Forget your Password? Submit a PATCH request with your new Password and password confirm to : ${resetURL}.\nIf Not Just Ignore the email`;

//   try {
//     await sendEmailToUser({
//       email: user.email,
//       subject: "Your password reset token is vaild for 15 min only",
//       message,
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email",
//     });
//   } catch (err) {
//     // If Any Error then immediatly remove that encryptedResetToken and resetTokenExpiresAt because user havent reset password
//     user.encryptedResetToken = undefined;
//     user.resetTokenExpiresAt = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError("There was an error sending email, Try Again"),
//       500
//     );
//   }
// };

// const resetPasswordFunction = async (req, res, next) => {
//   //its not necessay but safeguard
//   if (!req.params.token) {
//     return next(new AppError("Token is not provided, Try Again"), 400);
//   }

//   //Encrypt The Recived Token
//   // console.log(req.params.token);
//   // console.log("hi");
//   const encryptRecivedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   // console.log(encryptRecivedToken);

//   // get user based on token
//   const user = await UserModel.findOne({
//     encryptedResetToken: encryptRecivedToken,
//     resetTokenExpiresAt: { $gt: Date.now() }, // if expired token time is greater than now means , its still not expired, so we will get user
//   });

//   // console.log(user);

//   // set password if token is not expired and there is user, set the new Password
//   if (!user) {
//     return next(new AppError("Token is not valid or expired, Try Again"), 400);
//   }

//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   // console.log(user.password, req.body.passwordConfirm);
//   user.encryptedResetToken = undefined;
//   user.resetTokenExpiresAt = undefined;
//   await user.save();

//   // update lastPasswordChangeAt (Date) property for the user

//   // log the user in, send JWT
//   createSendToken(user, 200, res);

//   // const token = signToken(user._id);

//   // res.status(200).json({
//   //   status: "success",
//   //   token,
//   // });
// };

// exports.resetPassword = (req, res, next) =>
//   handleAsyncFunction(resetPasswordFunction, req, res, next);
