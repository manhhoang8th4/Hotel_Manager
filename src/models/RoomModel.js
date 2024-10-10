const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true }, // Số phòng
    numBedrooms: { type: Number, required: true }, // Số phòng ngủ
    numBalconies: { type: Number, required: true }, // Số lượng ban công
    numSofas: { type: Number, required: true }, // Số lượng ghế sofa
    price: { type: Number, required: true }, // Giá phòng
    available: { type: Boolean, default: true }, // Tình trạng phòng (có sẵn hay không)
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id; // Thêm thuộc tính "id" với giá trị từ "_id"
        delete ret._id; // Xóa "_id" khỏi object
        delete ret.__v; // Xóa "__v" phiên bản tài liệu trong MongoDB
        return ret;
      },
    },
  }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
