const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const authenticateToken = require("../middleware/authMiddleware");

// Đăng ký người dùng mới (POST request)
router.post("/sign-up", userController.createUser);

// Đăng nhập người dùng (POST request)
router.post("/sign-in", userController.loginUser);

// Cập nhật thông tin người dùng (PUT request)
router.put("/update-user/:id", authenticateToken, userController.updateUser);

// Xóa người dùng (DELETE request, yêu cầu xác thực token)
router.delete("/delete-user/:id", authenticateToken, userController.deleteUser);

module.exports = router;
