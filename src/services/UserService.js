require("dotenv").config();
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Lấy giá trị từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Hàm tạo Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

// Hàm tạo Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

// Tạo người dùng mới
const createUser = async (newUser) => {
  const { name, email, password, confirmPassword, phone } = newUser;

  // Kiểm tra các trường bắt buộc
  if (!name || !email || !password || !confirmPassword || !phone) {
    throw new Error("Thiếu thông tin cần thiết! Vui lòng kiểm tra lại.");
  }

  // Kiểm tra password và confirmPassword
  if (password !== confirmPassword) {
    throw new Error("Password và confirmPassword không khớp!");
  }

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email đã tồn tại, vui lòng chọn email khác!");
  }

  // Băm mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo người dùng mới và lưu vào DB
  const createdUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  // Tạo access_token và refresh_token với thông tin người dùng
  const access_token = generateAccessToken(createdUser);
  const refresh_token = generateRefreshToken(createdUser);

  // Cập nhật người dùng với token sau khi đã tạo
  createdUser.access_token = access_token;
  createdUser.refresh_token = refresh_token;
  await createdUser.save();

  return {
    status: "OK",
    message: "Tạo người dùng thành công",
    data: {
      user: createdUser,
      access_token,
      refresh_token,
    },
  };
};

// Đăng nhập người dùng
const loginUser = async (userLogin) => {
  const { email, password } = userLogin;

  if (!email || !password) {
    throw new Error("Thiếu email hoặc mật khẩu!");
  }

  // Kiểm tra email
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new Error("Email hoặc mật khẩu không đúng!");
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    throw new Error("Email hoặc mật khẩu không đúng!");
  }

  // Tạo token
  const access_token = generateAccessToken(existingUser);
  const refresh_token = generateRefreshToken(existingUser);

  return {
    status: "OK",
    message: "Đăng nhập thành công.",
    data: {
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
        phone: existingUser.phone,
      },
      access_token,
      refresh_token,
    },
  };
};

// Cập nhật thông tin người dùng
const updateUser = async (userUpdateData) => {
  const { email, name, password, phone } = userUpdateData;

  if (!email) {
    throw new Error("Email là trường bắt buộc.");
  }

  // Tìm người dùng để cập nhật
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new Error("Người dùng không tồn tại.");
  }

  // Khởi tạo đối tượng cập nhật
  let updatedData = {};

  if (name) updatedData.name = name;
  if (phone) updatedData.phone = phone;

  // Kiểm tra và băm mật khẩu mới nếu có
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedData.password = hashedPassword;
  }

  // Cập nhật người dùng
  const updatedUser = await User.findOneAndUpdate({ email }, updatedData, {
    new: true,
  });

  // Tạo lại access_token và refresh_token sau khi cập nhật
  const access_token = generateAccessToken(updatedUser);
  const refresh_token = generateRefreshToken(updatedUser);

  return {
    status: "OK",
    message: "Cập nhật người dùng thành công",
    data: {
      user: updatedUser,
      access_token,
      refresh_token,
    },
  };
};

// Xóa người dùng
const deleteUser = async (userId, req) => {
  if (!userId) {
    throw new Error("ID người dùng là trường bắt buộc.");
  }

  // Tìm người dùng cần xóa
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new Error("Người dùng không tồn tại.");
  }

  // Kiểm tra quyền của người dùng đăng nhập
  const adminUser = await User.findById(req.user.id);
  if (!adminUser || !adminUser.isAdmin) {
    throw new Error("Bạn không có quyền xóa người dùng này.");
  }

  // Không cho phép admin xóa tài khoản của chính mình
  if (adminUser._id.toString() === userId) {
    throw new Error("Bạn không thể xóa tài khoản của chính mình.");
  }

  // Xóa người dùng
  await User.deleteOne({ _id: userId });

  return {
    status: "OK",
    message: `Người dùng với ID ${userId} đã bị xóa thành công.`,
    deletedUser: existingUser,
  };
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  generateAccessToken,
  generateRefreshToken,
};
