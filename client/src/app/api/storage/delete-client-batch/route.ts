import { NextRequest, NextResponse } from 'next/server';
import { s3ForBucket, bucket } from '@/lib/aws/s3';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import FileUpload from '@/models/file-upload.model';

export async function POST(req: NextRequest) {
    const { refType, refId, batchId } = (await req.json()) as {
        refType: 'order' | 'quote';
        refId: string;
        batchId: string;
    };

    const batch = await FileUpload.findOne({
        refType,
        refId,
        uploadedBy: 'user',
        batchId,
    });
    if (!batch)
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 });

    const s3 = await s3ForBucket();

    const keys: string[] = [];
    let ContinuationToken: string | undefined;
    do {
        const page = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: batch.s3Prefix,
                ContinuationToken,
            })
        );
        for (const obj of page.Contents ?? []) keys.push(obj.Key!);
        ContinuationToken = page.IsTruncated
            ? page.NextContinuationToken
            : undefined;
    } while (ContinuationToken);

    while (keys.length) {
        const chunk = keys.splice(0, 1000);
        await s3.send(
            new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: { Objects: chunk.map((Key) => ({ Key })) },
            })
        );
    }

    await FileUpload.deleteOne({ _id: batch._id });

    return NextResponse.json({ ok: true });
}
