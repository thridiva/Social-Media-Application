const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection. Shutting Down....");
  console.log(err.name, err.message);
  process.exit(1); // 0 - success , 1 -> not success
});

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("Uncaught Exception. Shutting Down....");
  console.log(err.name, err.message);
  process.exit(1); // 0 - success , 1 -> not success
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const db = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(db).then(() => {
  console.log("Connected To DB");
});

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(port);
});
