const express = require("express");
const { paymentRoute } = require("./routes/paymentRoute");
require("dotenv").config();
const cors = require("cors");
const { imageRoute } = require("./routes/imageRoute");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api", paymentRoute);
app.use("/api/images", imageRoute);

app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
