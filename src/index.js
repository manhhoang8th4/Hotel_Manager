const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
dotenv.config();
require("dotenv").config();

const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3002;

// app.use(cors()); // Cho phép tất cả các origin

// app.get("/", (req, res) => {
//   res.send("Connect Succesfully");
// });

app.use(express.json()); // Middleware để xử lý JSON body
routes(app);

mongoose
  .connect(`mongodb://localhost:27017/`)
  .then(() => {
    console.log("connect db success");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("server is running in port: ", +port);
});
