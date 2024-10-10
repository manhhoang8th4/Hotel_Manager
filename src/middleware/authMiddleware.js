const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // Thêm model User để truy xuất từ DB

// Middleware để xác thực token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "ERR",
      message:
        "Không có token. Vui lòng cung cấp token để truy cập tài nguyên này.",
    });
  }

  const accessTokenSecret = process.env.JWT_SECRET;
  if (!accessTokenSecret) {
    return res.status(500).json({
      status: "ERR",
      message: "Lỗi hệ thống: Không tìm thấy secret key cho token.",
    });
  }

  // Xác thực token và lấy thông tin người dùng
  jwt.verify(token, accessTokenSecret, async (err, decodedToken) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({
          status: "ERR",
          message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
        });
      } else {
        console.error("Lỗi xác thực token:", err);
        return res.status(403).json({
          status: "ERR",
          message: "Token không hợp lệ.",
        });
      }
    }

    try {
      // Tìm người dùng trong cơ sở dữ liệu bằng ID từ token
      const user = await User.findById(decodedToken.id);

      if (!user) {
        return res.status(404).json({
          status: "ERR",
          message: "Người dùng không tồn tại.",
        });
      }

      // Cập nhật thông tin người dùng từ DB, bao gồm cả isAdmin
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin, // Lấy giá trị chính xác từ DB
      };

      next();
    } catch (dbError) {
      console.error("Lỗi khi truy vấn cơ sở dữ liệu:", dbError);
      return res.status(500).json({
        status: "ERR",
        message: "Lỗi hệ thống: không thể truy xuất thông tin người dùng.",
      });
    }
  });
};

module.exports = authenticateToken;
