/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import {
    s3ForBucket,
    bucket,
    CreateMultipartUploadCommand,
    PutObjectCommand, // only for typing; we sign client-side PUTs
    getSignedUrl,
} from '@/lib/aws/s3';
import { clientPrefix, adminPrefix, keyUnder } from '@/lib/aws/keys';
import OrderModel from '@/models/order.model';
import QuoteModel from '@/models/quote.model';
import { getNextRevision } from '@/lib/storage/record';
import dbConfig from '@/lib/dbConfig';

type InitFile = { filename: string; size: number; contentType?: string };

const SMALL_FILE_THRESHOLD = 8 * 1024 * 1024; // <8MB => single-part signed PUT
const TARGET_PARTS = 8;
const MIN_PART = 5 * 1024 * 1024;
const MAX_PART = 16 * 1024 * 1024;
const MPU_CONCURRENCY = 20; // cap parallel MPU creations

export async function POST(req: NextRequest) {
    await dbConfig();

    const {
        refType,
        refId,
        as,
        files,
        revision: inputRevision,
    } = (await req.json()) as {
        refType: 'order' | 'quote';
        refId: string;
        as: 'user' | 'admin';
        files: InitFile[];
        revision?: number;
    };

    if (
        !['order', 'quote'].includes(refType) ||
        !refId ||
        !['user', 'admin'].includes(as) ||
        !Array.isArray(files) ||
        files.length === 0
    ) {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
    if (files.some((f) => !f.size || f.size <= 0)) {
        return NextResponse.json({ error: 'Zero-size file' }, { status: 400 });
    }

    console.log(refId, refType);

    const doc =
        refType === 'order'
            ? await OrderModel.findOne({ orderID: refId })
            : await QuoteModel.findOne({ quoteID: refId });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const userID = doc.user.userID;
    const batchId = nanoid();
    const s3 = await s3ForBucket();

    const revision =
        as === 'admin'
            ? typeof inputRevision === 'number'
                ? inputRevision
                : await getNextRevision(refType, refId)
            : undefined;

    const basePrefix =
        as === 'user'
            ? clientPrefix({ userID, refType, refId, batchId })
            : adminPrefix({ userID, refType, refId, revision: revision! });

    // Split into small vs large
    const smallFiles: Array<{ key: string; f: InitFile }> = [];
    const largeFiles: Array<{ key: string; f: InitFile }> = [];
    for (const f of files) {
        const key = keyUnder(basePrefix, f.filename);
        (f.size < SMALL_FILE_THRESHOLD ? smallFiles : largeFiles).push({
            key,
            f,
        });
    }

    // For small files: sign single-part PUTs (no MPU)
    const smallPromises = smallFiles.map(async ({ key, f }) => {
        const url = await getSignedUrl(
            s3,
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                ContentType: f.contentType || 'application/octet-stream',
            }),
            { expiresIn: 60 * 15 }
        );
        return {
            key,
            mode: 'single' as const,
            putUrl: url,
            contentType: f.contentType || 'application/octet-stream',
        };
    });

    // For large files: create MPUs in parallel with a cap
    let i = 0;
    const resultsLarge: any[] = [];
    async function nextChunk() {
        if (i >= largeFiles.length) return;
        const slice = largeFiles.slice(i, i + MPU_CONCURRENCY);
        i += slice.length;
        const chunkRes = await Promise.all(
            slice.map(async ({ key, f }) => {
                const res = await s3.send(
                    new CreateMultipartUploadCommand({
                        Bucket: bucket,
                        Key: key,
                        ContentType:
                            f.contentType || 'application/octet-stream',
                    })
                );
                const recommendedPartSize = Math.min(
                    MAX_PART,
                    Math.max(MIN_PART, Math.ceil(f.size / TARGET_PARTS))
                );
                return {
                    key,
                    mode: 'mpu' as const,
                    uploadId: res.UploadId!,
                    recommendedPartSize,
                    contentType: f.contentType || 'application/octet-stream',
                };
            })
        );
        resultsLarge.push(...chunkRes);
        return nextChunk();
    }
    await nextChunk();

    const objects = [...(await Promise.all(smallPromises)), ...resultsLarge];

    return NextResponse.json({
        batchId,
        revision,
        basePrefix,
        objects,
    });
}
