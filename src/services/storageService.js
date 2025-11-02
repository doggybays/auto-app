import AWS from 'aws-sdk';
import fs from 'fs';
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

export async function uploadBufferToS3(buffer, key, contentType='image/jpeg') {
  const params = { Bucket: process.env.S3_BUCKET, Key: key, Body: buffer, ContentType: contentType, ACL: 'public-read' };
  await s3.putObject(params).promise();
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function uploadFileToS3(filePath, key, contentType='video/mp4') {
  const fileStream = fs.createReadStream(filePath);
  const params = { Bucket: process.env.S3_BUCKET, Key: key, Body: fileStream, ContentType: contentType, ACL: 'public-read' };
  await s3.upload(params).promise();
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
