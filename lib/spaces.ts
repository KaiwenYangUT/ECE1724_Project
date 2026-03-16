import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.SPACES_REGION;
const endpoint = process.env.SPACES_ENDPOINT;
const accessKeyId = process.env.SPACES_KEY;
const secretAccessKey = process.env.SPACES_SECRET;

if (!region || !endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing DigitalOcean Spaces environment variables");
}

export const spacesClient = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});