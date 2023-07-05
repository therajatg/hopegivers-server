const express = require("express");
const { paymentRoute } = require("./routes/paymentRoute");
require("dotenv").config();
const cors = require("cors");
const { imageRoute } = require("./routes/imageRoute");
const { contactRoute } = require("./routes/contactRoute");

const app = express();

app.use(
  cors({
    origin: "https://www.hopegiversfoundation.in",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/payment", paymentRoute);
app.use("/api/images", imageRoute);
app.use("/api/contacts", contactRoute);

app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
