import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import envConfig from "../config/env.config.js";

const {
    aws_access_key_id,
    aws_bucket,
    aws_prefix,
    aws_region,
    aws_secret_access_key,
} = envConfig;

export const s3 = new S3Client({
    region: aws_region,
    credentials: {
        accessKeyId: aws_access_key_id!,
        secretAccessKey: aws_secret_access_key!,
    },
    forcePathStyle: false,
});

export async function getPresignedUpload(req: Request, res: Response) {
    try {
        const { fileName, contentType, size, conversationID, senderID } =
            req.body;

        if (!fileName || !contentType || typeof size !== "number") {
             res.status(400).json({
                success: false,
                message: "fileName, contentType, size required",
            });return
        }
        if (size > 50 * 1024 * 1024) {
             res.status(400).json({
                success: false,
                message: "Max file size is 50MB",
            });return
        }
        if (!conversationID || !senderID) {
             res.status(400).json({
                success: false,
                message: "conversationID and senderID required",
            });return
        }
        
        const key = `${aws_prefix}/${conversationID}/${Date.now()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: aws_bucket,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 });

        res.status(200).json({
            success: true,
            upload: {
                url,
                method: "PUT",
                key,
                bucket: aws_bucket,
                publicUrl: `https://${aws_bucket}.s3.${aws_region}.amazonaws.com/${key}`,
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to presign upload",
        });
    }
}

