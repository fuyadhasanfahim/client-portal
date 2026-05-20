/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { s3ForBucket, bucket, getSignedUrl } from '@/lib/aws/s3';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import FileUpload from '@/models/file-upload.model';

type LeanFileItem = {
    key: string;
    filename?: string;
    size?: number;
    etag?: string;
    contentType?: string;
};
type LeanFileUpload = {
    s3Prefix: string;
    files: LeanFileItem[];
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const refType = (searchParams.get('refType') || '') as 'order' | 'quote';
    const refId = searchParams.get('refId') || '';
    const uploadedBy = (searchParams.get('uploadedBy') || '') as
        | 'user'
        | 'admin';
    const batchId = searchParams.get('batchId') || '';
    const revisionParam = searchParams.get('revision');
    const revision = revisionParam ? Number(revisionParam) : undefined;

    if (!refType || !refId || !uploadedBy) {
        return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const q: any = { refType, refId, uploadedBy };
    if (uploadedBy === 'user' && batchId) q.batchId = batchId;
    if (
        uploadedBy === 'admin' &&
        typeof revision === 'number' &&
        !Number.isNaN(revision)
    ) {
        q.revision = revision;
    }

    const batch = await FileUpload.findOne(q)
        .sort({ createdAt: -1 })
        .lean<LeanFileUpload>()
        .exec();

    if (!batch) {
        return NextResponse.json({ prefix: null, files: [] });
    }

    const s3 = await s3ForBucket();

    const filesFromDb = Array.isArray(batch.files) ? batch.files : [];
    const files = filesFromDb.length
        ? filesFromDb
        : await listByPrefix(batch.s3Prefix);

    const signed = await Promise.all(
        files.map(async (f) => {
            const url = await getSignedUrl(
                s3,
                new GetObjectCommand({ Bucket: bucket, Key: f.key }),
                { expiresIn: 60 * 15 }
            );
            return { ...f, url };
        })
    );

    return NextResponse.json({ prefix: batch.s3Prefix, files: signed });
}

async function listByPrefix(prefix: string) {
    const s3 = await s3ForBucket();
    const out: { key: string }[] = [];
    let ContinuationToken: string | undefined;

    do {
        const page = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken,
            })
        );
        for (const obj of page.Contents ?? []) out.push({ key: obj.Key! });
        ContinuationToken = page.IsTruncated
            ? page.NextContinuationToken
            : undefined;
    } while (ContinuationToken);

    return out.map(({ key }) => ({ key } as { key: string }));
}
