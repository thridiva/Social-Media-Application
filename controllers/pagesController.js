const handleAsyncFunction = require("../utils/handleAsyncFunction");
const UserModel = require("../models/userModel");
const AppError = require("../utils/appError");
const PostModel = require("./../models/postsModel");
const apiFeatures = require("./../utils/apiFeatures");
const axios = require("axios");

exports.getMainPage = (req, res, next) =>
  handleAsyncFunction(
    async (req, res, next) => {
      let query = PostModel.find();
      query = query.sort({ dateUploaded: -1 });

      let posts = await query;

      //TODO Filter, Like in feed the currenct user posts should not be there
      res.status(200).render("posts", { title: "AG", posts });
    },
    req,
    res,
    next
  );

// -------------------- Auth --------------------

// MiddleWare function , if user already logged in, if user tries to hit login page or signup page it should redirect to Home
exports.checkLoggedIn = (req, res, next) => {
  if (res.locals.user) {
    res.redirect("/");
    return;
  }
  next();
};

exports.getLoginForn = (req, res) => {
  res.status(200).render("login", {
    title: "Login into your account",
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Create Your Account",
  });
};

exports.account = async (req, res) => {
  // const base_url = req.protocol + "://" + req.get("host");
  // // console.log(base_url);
  // try {
  //   let resRecived = await axios({
  //     method: "GET",
  //     url: `${base_url}/api/users/me`,
  //     withCredentials: true,
  //   });
  //   console.log(resRecived);
  // } catch (err) {
  //   // console.log(err.response.data);
  // }

  let data = await req.user.populate({
    path: "posts",
    options: { sort: { dateUploaded: -1 } },
  });

  res.status(200).render("account", { data, title: "Account Details" });
};

exports.updateUserData = (req, res, next) =>
  handleAsyncFunction(
    async () => {
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user.id,
        {
          name: req.body.name,
          email: req.body.email,
          userName: req.body.username,
          about: req.body.about,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).render("account", {
        title: "Account Details",
        data: updatedUser,
      });
    },
    req,
    res,
    next
  );

// -------------------- Posts --------------------

exports.getPost = (req, res, next) =>
  handleAsyncFunction(
    async (req, res, next) => {
      let post = await PostModel.findById(req.params.id).populate({
        path: "interactions",
        select: "comment user",
      });

      if (!post) return next(new AppError("No Post Found", 404));
      // res.json({
      //   post,
      // });

      res.status(200).render("post", { post, title: "Post" });
    },
    req,
    res,
    next
  );

exports.getLatestPosts = (req, res, next) =>
  handleAsyncFunction(
    async (req, res, next) => {
      let posts = await PostModel.find().sort("-dateUploaded");
      // console.log(posts);
      // res.json({
      //   posts,
      // });

      res.status(200).render("posts", {
        posts,
        title: "Posts",
      });
    },
    req,
    res,
    next
  );

exports.createPost = (req, res) => {
  res.status(200).render("createPost", {
    title: "Create New Post",
  });
};
