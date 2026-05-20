import { NextRequest, NextResponse } from 'next/server';
import {
    s3ForBucket,
    UploadPartCommand,
    getSignedUrl,
    bucket,
} from '@/lib/aws/s3';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.nextUrl);
    const key = searchParams.get('key');
    const uploadId = searchParams.get('uploadId');
    const partNumber = Number(searchParams.get('partNumber') || '0');

    if (!key || !uploadId || !partNumber) {
        return NextResponse.json(
            { error: 'Missing query params' },
            { status: 400 }
        );
    }

    const s3 = await s3ForBucket();
    const cmd = new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 15 });
    return NextResponse.json({ url });
}
