const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    phone: { type: Number, required: true },
    access_token: { type: String,  },
    refresh_token: { type: String,  },
  },
  {
    timestamps: true,
    toJSON: {
      // Chỉnh sửa output JSON để thêm "id" và loại bỏ "_id"
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

const User = mongoose.model("User", userSchema);
module.exports = User;
