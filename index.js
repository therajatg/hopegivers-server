const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { paymentRoute } = require("./routes/paymentRoute");
const crypto = require("crypto");
require("dotenv").config();
const cors = require("cors");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey,
  },
  region: bucketRegion,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const randomImageName = () => crypto.randomBytes(16).toString("hex");
const imageName = randomImageName();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api", paymentRoute);

app.post("/api/posts", upload.single("image"), async (req, res) => {
  const file = req.file;
  const caption = req.body.caption;

  // console.log(file, caption);
  const buffer = await sharp(file.buffer)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer();

  const params = {
    Bucket: bucketName,
    // Key: req.file.originalname,
    Key: imageName,
    Body: buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  const post = await pool.query("INSERT INTO image VALUES($1, $2)", [
    imageName,
    caption,
  ]);

  res.send(post);
  // ...
});

app.get("/api/images", async (req, res) => {
  let images = await pool.query("SELECT * FROM image");
  images = images?.rows;
  console.log("images", images);
  for (let image of images) {
    // For each post, generate a signed URL and save it to the post object
    image.imageUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: image.imagename,
      }),
      { expiresIn: 3600 } // 3600 seconds
    );
  }
  res.json(images).status(200);
});

app.delete("/api/images/:imagename", async (req, res) => {
  const imagename = req.params.imagename;
  const deleteImage = await pool.query(
    "DELETE FROM image WHERE imagename = $1",
    [imagename]
  );

  console.log("deletImage", deleteImage);
  if (deleteImage?.rowCount) {
    const deleteParams = {
      Bucket: bucketName,
      Key: imagename,
    };
    s3.send(new DeleteObjectCommand(deleteParams));
    res.status(200).send("Image successfully deleted");
  } else {
    res.status(404).send("Image not found");
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
