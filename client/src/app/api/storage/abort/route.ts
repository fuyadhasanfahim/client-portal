import { NextRequest, NextResponse } from 'next/server';
import { s3ForBucket, bucket, AbortMultipartUploadCommand } from '@/lib/aws/s3';

export async function POST(req: NextRequest) {
    const { key, uploadId } = (await req.json()) as {
        key: string;
        uploadId: string;
    };
    if (!key || !uploadId)
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const s3 = await s3ForBucket();
    await s3.send(
        new AbortMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            UploadId: uploadId,
        })
    );
    return NextResponse.json({ ok: true });
}
