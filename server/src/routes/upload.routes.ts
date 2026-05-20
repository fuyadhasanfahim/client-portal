import { Router } from "express";
import { getPresignedUpload, s3 } from "../controllers/upload.controller.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import envConfig from "../config/env.config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router = Router();
router.post("/presign", getPresignedUpload);

router.get("/download", async (req, res) => {
    const { key } = req.query;
    try {
        const command = new GetObjectCommand({
            Bucket: envConfig.aws_bucket,
            Key: key as string,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        res.json({ success: true, url });
    } catch (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
    }
});

export const UploadRoutes = router;
