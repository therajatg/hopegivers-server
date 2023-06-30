const express = require("express");
const {
  postContact,
  getContact,
  deleteContact,
} = require("../controllers/contactController");
const contactRoute = express.Router();

contactRoute.route("/").post(postContact);
contactRoute.route("/").get(getContact);
contactRoute.route("/:id").delete(deleteContact);

module.exports = { contactRoute };
