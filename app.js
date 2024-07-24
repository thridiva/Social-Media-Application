const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoseSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
var cors = require("cors");
const path = require("path");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

// --------------- Routers ---------------

const postsRouter = require("./routes/postsRoutes");
const userRouter = require("./routes/userRoutes");
const pagesRouter = require("./routes/pagesRotues");
const interactionRouter = require("./routes/interactionsRouters");

//--------------- -------------------

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// --------------- Global MiddleWares ---------------

//TODO Remove Comment and keep normal
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://robohash.org"],
      // Add other directives as needed
    },
  })
);

if (process.env.NODE_ENV == "development") app.use(morgan("dev"));

// Limit Requests From Same IP
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message:
    "Invalid Activity Detected Or Too Many Requests From this IP, Try Again in an Hour!",
});

app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// --------------- Routes ---------------
app.use("/", pagesRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/interactions", interactionRouter);

app.all("*", function (req, res, next) {
  next(new AppError(`Cant Find ${req.originalUrl} on the server :(`, 404));
});

app.use(globalErrorHandler);

// console.log("came");
module.exports = app;
