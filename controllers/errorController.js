let AppError = require("./../utils/appError");

//TODO Refactor the sendProd and sendEnv

const handleCastErrorDB = (err) => {
  let message = `Invalid ${err.path}: ${err.value}`;
  // console.log("came");
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  let value = Object.keys(err.keyValue);
  value = value[0];
  const message = `Duplicate field value: '${value}'.This value has been already taken. This Field must be unique`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errorMessages = Object.values(err.errors).map((curr) => curr.message);

  const message = `Invalid input data. ${errorMessages.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //Website Render
    res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error("Error 🤯", err);
      res.status(500).json({
        status: "error",
        message: "Something Went Wrong :(",
      });
    }
  } else {
    if (err.isOperational) {
      //Website Render
      res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: "Please Try Again Later :(",
      });
    } else {
      console.error("Error 🤯", err);
      res.status(500).json({
        status: "error",
        message: "Something Went Wrong :(",
      });
    }
  }
};

const handleErrorJWT = () =>
  new AppError(`Invalid Token Please login again`, 401);

const handleErrorJWTExpired = () =>
  new AppError("Your Token has expired please login again!", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // process.env.NODE_ENV == "development"
  //   ? sendErrorDev(err, res)
  //   : sendErrorProd(err, res);
  // console.log(process.env.NODE_ENV == "production");
  if (process.env.NODE_ENV == "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV == "production") {
    let error = JSON.parse(JSON.stringify(err));

    if (err.name == "CastError") error = handleCastErrorDB(error);
    // if (err.name == "CastError") error = handleCastErrorDB(error);
    if (err.code == 11000) error = handleDuplicateFieldsDB(error);
    if (err.name == "JsonWebTokenError") error = handleErrorJWT();
    if (err.name == "TokenExpiredError") error = handleErrorJWTExpired();
    // console.log(err.code, "came");
    sendErrorProd(error, req, res);
  }

  next();
};
