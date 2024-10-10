const UserService = require("../services/UserService");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Tạo người dùng mới
const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({
        status: "ERR",
        message: "Tất cả các trường là bắt buộc.",
      });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "ERR",
        message: "Định dạng email không hợp lệ.",
      });
    }

    // Kiểm tra mật khẩu có khớp không
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "Mật khẩu và xác nhận mật khẩu không khớp.",
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "ERR",
        message: "Email đã được sử dụng.",
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    // Tạo token cho người dùng
    const access_token = UserService.generateAccessToken(newUser);
    const refresh_token = UserService.generateRefreshToken(newUser);

    // Lưu token vào DB
    newUser.access_token = access_token;
    newUser.refresh_token = refresh_token;
    await newUser.save();

    return res.status(201).json({
      status: "OK",
      message: "Tạo người dùng thành công.",
      data: { user: newUser, token: access_token },
    });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Có lỗi xảy ra trong quá trình tạo người dùng.",
      error: error.message,
    });
  }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res.status(400).json({
        status: "ERR",
        message: "Email và mật khẩu là bắt buộc.",
      });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "ERR",
        message: "Định dạng email không hợp lệ.",
      });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "ERR",
        message: "Người dùng không tồn tại.",
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: "ERR",
        message: "Mật khẩu không đúng.",
      });
    }

    // Tạo JWT cho người dùng
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      status: "OK",
      message: "Đăng nhập thành công.",
      data: { user, token },
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: "Có lỗi xảy ra khi đăng nhập.",
      error: error.message,
    });
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const { email, name, password, confirmPassword, phone, isAdmin } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !name || !phone) {
      return res.status(400).json({
        status: "ERR",
        message: "Email, tên và số điện thoại là bắt buộc.",
      });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "ERR",
        message: "Định dạng email không hợp lệ.",
      });
    }

    // Kiểm tra mật khẩu nếu có thay đổi
    if (password && password !== confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "Mật khẩu không khớp với mật khẩu xác nhận.",
      });
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "ERR",
        message: "Người dùng không tồn tại.",
      });
    }

    // Cập nhật thông tin người dùng
    const updatedData = {
      name,
      phone,
      ...(password && { password: await bcrypt.hash(password, 10) }),
      ...(isAdmin !== undefined && { isAdmin }),
    };

    const updatedUser = await User.findOneAndUpdate({ email }, updatedData, {
      new: true,
    });

    return res.status(200).json({
      status: "OK",
      message: "Cập nhật thông tin người dùng thành công.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: "Có lỗi xảy ra khi cập nhật thông tin người dùng.",
      error: error.message,
    });
  }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id); // Lấy thông tin người dùng đã đăng nhập
    const userId = req.params.id;

    // Kiểm tra quyền admin
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({
        status: "ERR",
        message: "Bạn không có quyền xóa người dùng.",
      });
    }

    // Lấy thông tin người dùng cần xóa
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({
        status: "ERR",
        message: "Người dùng không tồn tại.",
      });
    }

    // Không cho phép admin tự xóa tài khoản của chính mình
    if (
      userToDelete.isAdmin &&
      userToDelete._id.toString() === adminUser._id.toString()
    ) {
      return res.status(403).json({
        status: "ERR",
        message: "Bạn không thể xóa tài khoản admin của chính mình.",
      });
    }

    // Tiến hành xóa người dùng
    await User.deleteOne({ _id: userId });

    return res.status(200).json({
      status: "OK",
      message: `Người dùng với ID ${userId} đã được xóa thành công.`,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: "Có lỗi xảy ra khi xóa người dùng.",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
};
