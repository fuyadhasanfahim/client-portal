import { NextRequest, NextResponse } from 'next/server';
import { recordBatchAndUpdateLinks } from '@/lib/storage/record';

export async function POST(req: NextRequest) {
    const { refType, refId, as, userID, batchId, s3Prefix, files, revision } =
        await req.json();

    if (
        !refType ||
        !refId ||
        !as ||
        !userID ||
        !batchId ||
        !s3Prefix ||
        !Array.isArray(files) ||
        files.length === 0
    ) {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    await recordBatchAndUpdateLinks({
        refType,
        refId,
        userID,
        uploadedBy: as,
        revision,
        batchId,
        s3Prefix,
        files,
    });

    const link =
        as === 'user'
            ? `/api/storage/download?refType=${refType}&refId=${refId}&uploadedBy=user&batchId=${batchId}`
            : `/api/storage/download?refType=${refType}&refId=${refId}&uploadedBy=admin&revision=${revision}`;

    return NextResponse.json({ ok: true, link });
}
