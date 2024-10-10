const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/BookingController");

// API để tạo một đơn đặt phòng
router.post("/create", bookingController.createBooking);

// API để lấy danh sách tất cả các đơn đặt phòng
router.get("/all", bookingController.getAllBookings);

// API để lấy thông tin một đơn đặt phòng theo ID
router.get("/:phone", bookingController.getBookingsByPhone);

// API để xóa một đơn đặt phòng
router.delete("/:id", bookingController.deleteBooking);

module.exports = router;
