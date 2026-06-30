import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { s3Client } from '@/core/storage/s3.bucket';

@Injectable()
export class S3StorageService {
  async insertFileToS3Bucket({
    fileName,
    body,
  }: {
    fileName: string;
    body: Buffer;
  }): Promise<string> {
    const response = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: body,
      }),
    );

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `S3 upload failed with status ${response.$metadata.httpStatusCode}`,
      );
    }

    // Fix: ensure a / between base URL and filename
    const baseUrl = process.env.AWS_S3_BUCKET_URL!.replace(/\/$/, '');
    const url = `${baseUrl}/${fileName}`;

    return url;
  }
  async retrieveFileFromS3Bucket({ fileName }: { fileName?: string }) {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
      }),
    );

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `S3 retrieve failed with status ${response.$metadata.httpStatusCode}`,
      );
    }

    return response;
  }

  async deleteFileFromS3Bucket({ fileName }: { fileName: string }) {
    const response = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
      }),
    );
    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `S3 retrieve failed with status ${response.$metadata.httpStatusCode}`,
      );
    }

    // TODO :: get the data for postgres.

    return response;
  }
}; 
