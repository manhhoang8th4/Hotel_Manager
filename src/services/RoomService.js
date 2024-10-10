require("dotenv").config();
const Room = require("../models/RoomModel"); // Đường dẫn đến mô-đun Room

class RoomService {
  // Tạo phòng mới
  async createRoom(roomData) {
    // Kiểm tra các trường bắt buộc
    const { roomNumber, numBedrooms, numBalconies, numSofas, price } = roomData;

    if (!roomNumber || !numBedrooms || !numBalconies || !numSofas || !price) {
      throw new Error(
        "Vui lòng cung cấp đầy đủ thông tin phòng (số phòng, số phòng ngủ, số lượng ban công, số lượng ghế sofa, và giá phòng)."
      );
    }

    // Kiểm tra xem số phòng đã tồn tại chưa
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      throw new Error("Phòng đã tồn tại với số phòng này.");
    }

    // Tạo mới phòng
    const room = new Room({
      roomNumber,
      numBedrooms,
      numBalconies,
      numSofas,
      price,
    });
    return await room.save();
  }

  // Lấy danh sách tất cả các phòng
  async getAllRooms() {
    return await Room.find();
  }

  // Lấy thông tin phòng theo mã phòng
  async getRoomByRoomNumber(roomNumber) {
    return await Room.findOne({ roomNumber });
  }

  async updateRoom(roomNumber, roomData) {
    console.log("Đang cố gắng cập nhật phòng:", roomNumber);
    console.log("Dữ liệu cập nhật:", roomData);

    // Lấy thông tin phòng cần cập nhật
    const { numBedrooms, numBalconies, numSofas, price } = roomData;

    // Kiểm tra các trường bắt buộc
    if (!roomNumber || !numBedrooms || !numBalconies || !numSofas || !price) {
      throw new Error(
        "Vui lòng cung cấp đầy đủ thông tin phòng (số phòng, số phòng ngủ, số lượng ban công, số lượng ghế sofa, và giá phòng)."
      );
    }

    // Tìm phòng hiện tại trong cơ sở dữ liệu
    const roomToUpdate = await Room.findOne({ roomNumber });

    // Kiểm tra xem phòng có tồn tại không
    if (!roomToUpdate) {
      console.log("Không tìm thấy phòng với mã phòng:", roomNumber);
      throw new Error("Không tìm thấy phòng để cập nhật.");
    }

    // Kiểm tra số phòng chỉ khi nó thay đổi
    const existingRoom = await Room.findOne({ roomNumber });
    if (
      existingRoom &&
      existingRoom._id.toString() !== roomToUpdate._id.toString()
    ) {
      throw new Error("Phòng đã tồn tại với số phòng này.");
    }

    // Cập nhật phòng và trả về thông tin phòng đã cập nhật
    return await Room.findOneAndUpdate({ roomNumber }, roomData, { new: true });
  }

  // Xóa phòng
  async deleteRoom(roomId) {
    return await Room.findByIdAndDelete(roomId);
  }
}

module.exports = new RoomService();
