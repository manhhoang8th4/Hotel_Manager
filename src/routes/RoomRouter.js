const RoomController = require("../controllers/RoomController");

const express = require("express");
const router = express.Router();

router.post("/create", RoomController.createRoom);
router.get("/rooms", RoomController.getAllRooms);
router.get("/rooms/:roomNumber", RoomController.getRoomByRoomNumber);
router.put("/rooms/:roomNumber", RoomController.updateRoom);
router.delete("/rooms/:id", RoomController.deleteRoom);

module.exports = router;
