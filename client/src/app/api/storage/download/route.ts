/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { PassThrough, Readable } from 'stream';
import * as _archiver from 'archiver';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3ForBucket, getSignedUrl } from '@/lib/aws/s3';
import FileUpload from '@/models/file-upload.model';
import { bucketName } from '@/lib/aws/s3';

type RefType = 'order' | 'quote';
type By = 'user' | 'admin';

type LeanFileItem = {
    key: string;
    filename?: string;
    size?: number;
    etag?: string;
    contentType?: string;
};

type LeanFileUpload = {
    files: LeanFileItem[];
    s3Prefix: string;
    refType: RefType;
    refId: string;
    uploadedBy: By;
    batchId?: string;
    revision?: number;
};

function filenameFromKey(key: string) {
    const parts = key.split('/');
    return parts[parts.length - 1] || 'file';
}

function slugify(s: string) {
    return s
        .replace(/[^\w.-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const refType = (searchParams.get('refType') || '') as RefType;
    const refId = searchParams.get('refId') || '';
    const uploadedBy = (searchParams.get('uploadedBy') || '') as By;
    const batchId = searchParams.get('batchId') || '';
    const revStr = searchParams.get('revision');
    const revision = revStr ? Number(revStr) : undefined;

    if (!refType || !refId || !uploadedBy) {
        return new Response(JSON.stringify({ error: 'Missing params' }), {
            status: 400,
        });
    }

    const query: any = { refType, refId, uploadedBy };
    if (uploadedBy === 'user' && batchId) query.batchId = batchId;
    if (
        uploadedBy === 'admin' &&
        typeof revision === 'number' &&
        !Number.isNaN(revision)
    ) {
        query.revision = revision;
    }

    const batch = await FileUpload.findOne(query)
        .sort({ createdAt: -1 })
        .lean<LeanFileUpload>()
        .exec();

    if (!batch) {
        return new Response(JSON.stringify({ error: 'Batch not found' }), {
            status: 404,
        });
    }

    const files = Array.isArray(batch.files) ? batch.files.filter(Boolean) : [];
    if (files.length === 0) {
        return new Response(JSON.stringify({ error: 'No files in batch' }), {
            status: 404,
        });
    }

    const bucket = bucketName();
    const s3 = await s3ForBucket();

    if (files.length === 1) {
        const only = files[0]!;
        const downloadName = only.filename ?? filenameFromKey(only.key);
        const url = await getSignedUrl(
            s3,
            new GetObjectCommand({
                Bucket: bucket,
                Key: only.key,
                ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
                    downloadName
                )}"`,
            }),
            { expiresIn: 60 * 15 }
        );
        return Response.redirect(url, 302);
    }

    const zipNameBase = slugify(
        uploadedBy === 'admin'
            ? `${refType}-${refId}-rev-${revision ?? 'latest'}`
            : `${refType}-${refId}-${batchId || 'batch'}`
    );

    const headers = new Headers({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipNameBase}.zip"`,
        'Cache-Control': 'no-store',
    });

    const pass = new PassThrough();
    const archive = new (_archiver as any).ZipArchive({ zlib: { level: 9 } });

    const webStream = Readable.toWeb(pass) as unknown as ReadableStream;
    archive.on('error', (err: any) => pass.destroy(err));
    archive.pipe(pass);

    for (const item of files) {
        const obj = await s3.send(
            new GetObjectCommand({
                Bucket: bucket,
                Key: item.key,
            })
        );
        const body = obj.Body as Readable;
        const name = item.filename ?? filenameFromKey(item.key);
        archive.append(body, { name });
    }

    void (async () => {
        try {
            await archive.finalize();
        } catch (e) {
            pass.destroy(e as Error);
        }
    })();

    return new Response(webStream, { headers });
}
