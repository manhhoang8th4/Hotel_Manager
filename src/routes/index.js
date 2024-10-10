const bodyParser = require("body-parser");

const UserRouter = require("./UserRouter");
const RoomRouter = require("./RoomRouter");
const BookingRouter = require("./BookingRouter");

// Định nghĩa các route cho user và room
const routes = (app) => {
  app.use(bodyParser.json()); // Đảm bảo sử dụng body-parser để parse JSON body
  app.use("/api/user", UserRouter); // Route cho user
  app.use("/api/room", RoomRouter); // Route cho
  app.use("/api/booking", BookingRouter); // Route cho room
};

module.exports = routes;
