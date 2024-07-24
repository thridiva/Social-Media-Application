const handleAsyncFunction = require("../utils/handleAsyncFunction");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const mongoose = require("mongoose");

exports.deleteOne = (Model) => (req, res, next) =>
  handleAsyncFunction(
    async (req, res) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, {
        deletedPost: true,
      });

      if (!doc) {
        return next(new AppError("Cant Find The document With Given ID", 404));
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    },
    req,
    res,
    next
  );

let filterFunction = (recivedObj, optionsToAccept) => {
  let obj = {};

  Object.keys(recivedObj).forEach((curr) => {
    if (optionsToAccept.includes(curr)) {
      obj[curr] = recivedObj[curr];
    }
  });

  return obj;
};

exports.updateOne = (Model, optionsToAccept) => (req, res, next) =>
  handleAsyncFunction(
    async (req, res, next) => {
      let docUpdated = filterFunction(req.body, optionsToAccept);

      if (Object.keys(docUpdated).length == 0) {
        return next(new AppError("Invalid Updation, Try Again!!", 400));
      }

      const doc = await Model.findByIdAndUpdate(req.params.id, docUpdated, {
        new: true,
        runValidators: true,
      });

      // const doc = await Model.findById(req.params.id);

      if (!doc) {
        return next(new AppError("Cant Find The document With Given ID", 404));
      }

      // doc.set(req.body);
      // await doc.validate();
      // await doc.save();

      res.status(200).json({
        status: "success",
        data: {
          data: doc,
        },
      });
    },
    req,
    res,
    next
  );

exports.createOne =
  (Model, optionsToAccept, keepUserManually, populate) => (req, res, next) =>
    handleAsyncFunction(
      async (req, res) => {
        let finalDoc = req.body;

        if (optionsToAccept) {
          finalDoc = filterFunction(req.body, optionsToAccept);
        }

        if (keepUserManually) {
          let userId = req.user._id;
          finalDoc.userCreated = userId;
        }

        const doc = await Model.create(finalDoc);
        // console.log(doc);

        if (populate) {
          await doc.populate({
            path: "userCreated",
            select: "-email -role",
          });
        }

        res.status(201).json({
          status: "success",
          data: {
            data: doc,
          },
        });
      },
      req,
      res,
      next
    );

exports.getOne = (Model, populateOptions) => (req, res, next) =>
  handleAsyncFunction(
    async (req, res, next) => {
      let recivedId = req.params.id;
      let query = Model.findById(recivedId);

      if (populateOptions) {
        populateOptions.forEach((curr) => {
          query = query.populate(curr);
        });
      }

      const doc = await query;

      // doc = await Model.findById(recivedId).populate({
      //   path: "reviews",
      //   select: "-__v -id",
      // });

      // Model.findOne({_id:recivedId})

      if (!doc) {
        return next(new AppError("Cant Find The doc", 404));
      }

      // res.locals.userData = doc;

      res.status(200).json({
        status: "success",
        data: {
          data: doc,
        },
      });
    },
    req,
    res,
    next
  );

exports.getAll = (Model) => (req, res, next) =>
  handleAsyncFunction(
    async (req, res) => {
      // console.log(req.url);
      // console.log(req.query);

      // To Allow For Nest Get Reviews On Tour
      let filter;
      if (req.params.tourId) filter = { tour: req.params.tourId };
      // console.log(filter);
      // --------------- Build Query ---------------
      let query = Model.find(filter); // All Model Obj

      // --------------- Sorting Based On Difficulty ---------------
      // TODO Add Sorting

      // --------------- Execute Query ---------------

      const features = new APIFeatures(query, req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const doc = await features.query;
      // doc._id = undefined
      // console.log(doc.length);
      // const doc = await features.query.explain();

      // --------------- Final Response ---------------
      // console.log(doc);
      res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        results: doc.length,
        data: {
          data: doc,
        },
      });
    },
    req,
    res,
    next
  );
