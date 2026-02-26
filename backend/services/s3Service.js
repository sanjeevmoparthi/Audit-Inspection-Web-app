const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

const uploadToS3 = async (file, path) => {
  const fileName = `${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${path}/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
     ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(params));

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
};

module.exports = { uploadToS3 };