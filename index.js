const express = require("express");

require("dotenv").config();
const cors = require("cors");
const { paymentRoute } = require("./routes/paymentRoute");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api", paymentRoute);

app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
