import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY as string, 
    secretAccessKey:process.env.AWS_S3_SECRET_ACCESS_KEY as string 
  },
});

export { s3Client };


