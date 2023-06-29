const crypto = require("crypto");
const sharp = require("sharp");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const Pool = require("pg").Pool;
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const getRandomimageName = () => crypto.randomBytes(16).toString("hex");

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

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
});

const postImage = async (req, res) => {
  const randomImageName = getRandomimageName();
  try {
    const file = req.file;

    // const buffer = await sharp(file.buffer)
    //   .resize({ height: 1920, width: 1080, fit: "contain" })
    //   .toBuffer();

    const params = {
      Bucket: bucketName,
      // Key: req.file.originalname,
      Key: randomImageName,
      Body: file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const post = await pool.query("INSERT INTO image VALUES($1)", [
      randomImageName,
    ]);

    res.status(200).json({ msg: "Image successfully uploaded" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getImage = async (req, res) => {
  try {
    let images = await pool.query("SELECT * FROM image");
    images = images?.rows;

    for (let image of images) {
      image.imageUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: image.imagename,
        }),
        { expiresIn: 3600 } // 3600 seconds
      );
    }
    res.status(200).json(images);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const deleteImage = async (req, res) => {
  try {
    const imageName = req.params.imageName;
    const deleteImage = await pool.query(
      "DELETE FROM image WHERE imagename = $1",
      [imageName]
    );
    if (deleteImage?.rowCount) {
      const deleteParams = {
        Bucket: bucketName,
        Key: imageName,
      };
      s3.send(new DeleteObjectCommand(deleteParams));
      res.status(200).json({ msg: "Image successfully deleted" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = { postImage, getImage, deleteImage };
