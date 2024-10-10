const bookingService = require("../services/BookingService"); // Đường dẫn đến BookingService

class BookingController {
  // API để tạo một đơn đặt phòng
  async createBooking(req, res) {
    try {
      const { roomNumber, customerName, phone, checkInDate, checkOutDate } =
        req.body;

      // Gọi BookingService để tạo đơn đặt phòng
      const newBooking = await bookingService.createBooking({
        roomNumber,
        customerName,
        phone,
        checkInDate,
        checkOutDate,
      });

      // Trả về thông tin đơn đặt phòng mới với mã 201 (Created)
      res.status(201).json({
        message: "Đơn đặt phòng đã được tạo thành công!",
        booking: newBooking,
      });
    } catch (error) {
      res.status(500).json({
        message: "Có lỗi xảy ra khi tạo đơn đặt phòng.",
        error: error.message || error,
      });
    }
  }
  // API để lấy danh sách tất cả các đơn đặt phòng
  async getAllBookings(req, res) {
    try {
      const bookings = await bookingService.getAllBookings();
      res.status(200).json({
        message: "Danh sách đơn đặt phòng đã được lấy thành công.",
        bookings,
      });
    } catch (error) {
      res.status(500).json({
        message: "Có lỗi xảy ra khi lấy danh sách đơn đặt phòng.",
        error: error.message || error,
      });
    }
  }

  // API để lấy thông tin đơn đặt phòng theo số điện thoại
  async getBookingsByPhone(req, res) {
    try {
      const { phone } = req.params;
      const bookings = await bookingService.getBookingsByPhone(phone);

      if (bookings.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy đơn đặt phòng nào với số điện thoại này.",
        });
      }

      res.status(200).json({
        message: "Thông tin đơn đặt phòng đã được lấy thành công.",
        bookings,
      });
    } catch (error) {
      res.status(500).json({
        message: "Có lỗi xảy ra khi lấy thông tin đơn đặt phòng.",
        error: error.message || error,
      });
    }
  }

  // API để xóa một đơn đặt phòng
  async deleteBooking(req, res) {
    try {
      const { id } = req.params;
      const deletedBooking = await bookingService.deleteBooking(id);

      if (!deletedBooking) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy đơn đặt phòng để xóa." });
      }

      res.status(204).send(); // Trả về 204 No Content sau khi xóa thành công
    } catch (error) {
      res.status(500).json({
        message: "Có lỗi xảy ra khi xóa đơn đặt phòng.",
        error: error.message || error,
      });
    }
  }
}

module.exports = new BookingController();
