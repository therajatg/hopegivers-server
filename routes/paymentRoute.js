const express = require("express");
const paymentRoute = express.Router();
const {
  paymentVerification,
  checkout,
} = require("../controllers/paymentController");

paymentRoute.post("/checkout", (req, res) => checkout);

paymentRoute.post("/paymentverification", (req, res) => paymentVerification);

paymentRoute.get("/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);

module.exports = { paymentRoute };
