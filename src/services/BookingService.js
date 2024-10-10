const Booking = require("../models/BookingModel");
const Room = require("../models/RoomModel"); // Để kiểm tra phòng có sẵn

class BookingService {
  // Tạo đặt phòng
  async createBooking(bookingData) {
    const { roomNumber, customerName, phone, checkInDate, checkOutDate } =
      bookingData;

    // Kiểm tra các trường bắt buộc
    if (
      !roomNumber ||
      !customerName ||
      !phone ||
      !checkInDate ||
      !checkOutDate
    ) {
      throw new Error("Vui lòng cung cấp đầy đủ thông tin đặt phòng.");
    }

    // Kiểm tra xem phòng có sẵn hay không
    const room = await Room.findOne({ roomNumber }); // Tìm phòng theo số phòng
    if (!room || !room.available) {
      throw new Error("Phòng không có sẵn để đặt.");
    }

    // Tạo booking với thông tin từ người dùng
    const booking = new Booking({
      roomId: room._id, // Sử dụng ID của phòng
      customerName,
      phone, // Số điện thoại từ thông tin đặt phòng
      checkInDate,
      checkOutDate,
    });

    return await booking.save();
  }

  // Lấy tất cả các đơn đặt phòng
  async getAllBookings() {
    return await Booking.find().populate("roomId");
  }

  // Lấy thông tin đặt phòng theo số điện thoại
  async getBookingsByPhone(phone) {
    return await Booking.find({ phone }).populate("roomId");
  }

  // Xóa đặt phòng
  async deleteBooking(bookingId) {
    return await Booking.findByIdAndDelete(bookingId);
  }
}

module.exports = new BookingService();
