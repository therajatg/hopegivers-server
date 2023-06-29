const express = require("express");
const imageRoute = express.Router();
const multer = require("multer");
const {
  getImage,
  postImage,
  deleteImage,
} = require("../controllers/imageController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

imageRoute.route("/").post(upload.single("image"), postImage);
imageRoute.route("/").get(getImage);
imageRoute.route("/").delete(deleteImage);

module.exports = { imageRoute };
