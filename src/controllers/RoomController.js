const roomService = require("../services/RoomService"); // Đường dẫn đến RoomService

class RoomController {
  // API để tạo một phòng mới
  async createRoom(req, res) {
    try {
      const { roomNumber, numBedrooms, numBalconies, numSofas, price } =
        req.body;

      // Kiểm tra xem các trường bắt buộc đã được nhập hay chưa
      if (!roomNumber || !numBedrooms || !numBalconies || !numSofas || !price) {
        return res.status(400).json({
          message:
            "Vui lòng cung cấp số phòng, số phòng ngủ, số lượng ban công, số lượng ghế sofa và giá phòng.",
        });
      }

      // Gọi RoomService để tạo phòng
      const newRoom = await roomService.createRoom({
        roomNumber,
        numBedrooms,
        numBalconies,
        numSofas,
        price,
      });

      // Trả về thông tin phòng mới với mã 201 (Created)
      res.status(201).json({
        message: "Phòng đã được tạo thành công!", // Thông báo xác nhận
        room: newRoom, // Thông tin phòng mới
      });
    } catch (error) {
      res.status(500).json({
        message: "Có lỗi xảy ra khi tạo phòng.",
        error: error.message || error,
      });
    }
  }

  // API để lấy danh sách tất cả các phòng
  async getAllRooms(req, res) {
    try {
      const rooms = await roomService.getAllRooms();
      res.status(200).json({
        message: "Danh sách phòng đã được lấy thành công.",
        rooms, // Danh sách các phòng
      });
    } catch (error) {
      res.status(500).json({
        message: "Có lỗi xảy ra khi lấy danh sách phòng.",
        error: error.message || error,
      });
    }
  }

  // API để lấy chi tiết một phòng theo mã phòng
  async getRoomByRoomNumber(req, res) {
    try {
      const { roomNumber } = req.params; // Lấy mã phòng từ tham số
      const room = await roomService.getRoomByRoomNumber(roomNumber); // Gọi dịch vụ lấy phòng theo mã phòng

      if (!room) {
        return res.status(404).json({ message: "Không tìm thấy phòng." });
      }
      res.status(200).json({
        message: "Thông tin phòng đã được lấy thành công.",
        room, // Thông tin chi tiết phòng
      });
    } catch (error) {
      res.status(500).json({
        message: "Có lỗi xảy ra khi lấy thông tin phòng.",
        error: error.message || error,
      });
    }
  }

  // API để cập nhật thông tin một phòng
  async updateRoom(req, res) {
    try {
      const { roomNumber } = req.params; // Lấy mã phòng từ tham số
      const roomData = req.body; // Lấy dữ liệu phòng từ body

      // Kiểm tra xem các trường bắt buộc đã được nhập hay chưa
      if (
        !roomNumber ||
        !roomData.numBedrooms ||
        !roomData.numBalconies ||
        !roomData.numSofas ||
        !roomData.price
      ) {
        return res.status(400).json({
          message:
            "Vui lòng cung cấp số phòng, số phòng ngủ, số lượng ban công, số lượng ghế sofa và giá phòng.",
        });
      }

      const updatedRoom = await roomService.updateRoom(roomNumber, roomData);

      if (!updatedRoom) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy phòng để cập nhật." });
      }

      res.status(200).json({
        message: "Phòng đã được cập nhật thành công.",
        room: updatedRoom, // Thông tin phòng đã được cập nhật
      });
    } catch (error) {
      console.error("Lỗi:", error); // Ghi log lỗi
      res.status(500).json({
        message: "Có lỗi xảy ra khi cập nhật phòng.",
        error: error.message || error,
      });
    }
  }

  // API để xóa một phòng
  async deleteRoom(req, res) {
    try {
      const { roomNumber } = req.params; // Lấy mã phòng từ tham số
      const deletedRoom = await roomService.deleteRoom(roomNumber);

      if (!deletedRoom) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy phòng để xóa." });
      }

      res.status(204).send(); // Trả về 204 No Content sau khi xóa thành công
    } catch (error) {
      res.status(500).json({
        message: "Có lỗi xảy ra khi xóa phòng.",
        error: error.message || error,
      });
    }
  }
}

module.exports = new RoomController();
