import { NextRequest, NextResponse } from 'next/server';
import {
    s3ForBucket,
    bucket,
    CompleteMultipartUploadCommand,
} from '@/lib/aws/s3';
import { recordBatchAndUpdateLinks } from '@/lib/storage/record';

type RefType = 'order' | 'quote';
type AsWho = 'user' | 'admin';

export async function POST(req: NextRequest) {
    const { refType, refId, as, batchId, revision, s3Prefix, objects, userID } =
        (await req.json()) as {
            refType: RefType;
            refId: string;
            as: AsWho;
            batchId: string;
            revision?: number;
            s3Prefix?: string;
            userID: string;
            objects: Array<{
                key: string;
                uploadId: string;
                parts: { PartNumber: number; ETag: string }[];
                size?: number;
                filename?: string;
                contentType?: string;
            }>;
        };

    if (!refType || !refId || !as || !batchId || !objects?.length) {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const s3 = await s3ForBucket();

    for (const obj of objects) {
        await s3.send(
            new CompleteMultipartUploadCommand({
                Bucket: bucket,
                Key: obj.key,
                UploadId: obj.uploadId,
                MultipartUpload: {
                    Parts: obj.parts.sort(
                        (a, b) => a.PartNumber - b.PartNumber
                    ),
                },
            })
        );
    }

    await recordBatchAndUpdateLinks({
        refType,
        refId,
        userID,
        uploadedBy: as,
        revision,
        batchId,
        s3Prefix:
            s3Prefix ??
            (objects[0]?.key?.split('/').slice(0, -1).join('/') || ''),
        files: objects.map((o) => ({
            key: o.key,
            filename: o.filename,
            size: o.size,
            etag: o.parts?.[o.parts.length - 1]?.ETag,
            contentType: o.contentType,
        })),
    });

    const link =
        as === 'user'
            ? `/api/storage/download?refType=${refType}&refId=${refId}&uploadedBy=client&batchId=${batchId}`
            : `/api/storage/download?refType=${refType}&refId=${refId}&uploadedBy=admin&revision=${revision}`;

    return NextResponse.json({ ok: true, link });
}
