const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();
const cors = require("cors");
const { paymentRoute } = require("./routes/paymentRoute");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", paymentRoute);

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);

module.exports = { instance };
