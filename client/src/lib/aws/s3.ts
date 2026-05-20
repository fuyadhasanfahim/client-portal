import {
    S3Client,
    GetBucketLocationCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials missing in env');
}
if (!process.env.AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET missing in env');
}

export const bucket = process.env.AWS_S3_BUCKET!;
const fallbackRegion = process.env.AWS_REGION!;

const rawPrefix = process.env.AWS_S3_PREFIX ?? 'uploads';
const normPrefix = rawPrefix.replace(/^\/+|\/+$/g, '');
export const basePrefix = normPrefix.length ? normPrefix : 'uploads';

let cachedBucketRegion: string | null = null;

export async function getBucketRegion(): Promise<string> {
    if (cachedBucketRegion) return cachedBucketRegion;

    const probe = new S3Client({
        region: fallbackRegion,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });

    const res = await probe.send(
        new GetBucketLocationCommand({ Bucket: bucket })
    );
    const region =
        (res.LocationConstraint as string | undefined) || 'ap-south-1';
    cachedBucketRegion = region;
    return region;
}

export async function s3ForBucket(): Promise<S3Client> {
    const region = await getBucketRegion();
    return new S3Client({
        region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });
}

export async function bucketBaseUrl(): Promise<string> {
    const region = await getBucketRegion();
    return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export function bucketName(): string {
    return bucket; // or process.env.AWS_S3_BUCKET!
}

export {
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
    PutObjectCommand,
    getSignedUrl,
};
