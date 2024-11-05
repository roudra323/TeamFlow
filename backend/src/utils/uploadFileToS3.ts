import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';

// Create an S3 client
const s3 = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Function to upload a file to S3
// Upload a file to S3
export const uploadFileToS3 = async (filePath: string, fileName: string) => {
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: fileContent,
    };

    const command = new PutObjectCommand(params);
    const data = await s3.send(command);
    return `https://${params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Key}`;
};


// Function to delete a file from S3
export const deleteFileFromS3 = async (fileName: string) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);
};
