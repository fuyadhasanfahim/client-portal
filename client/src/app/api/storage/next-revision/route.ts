import { NextRequest, NextResponse } from 'next/server';
import { getNextRevision } from '@/lib/storage/record';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const refType = (searchParams.get('refType') || '') as 'order' | 'quote';
    const refId = searchParams.get('refId') || '';
    if (!refType || !refId)
        return NextResponse.json({ error: 'Missing' }, { status: 400 });
    const revision = await getNextRevision(refType, refId);
    return NextResponse.json({ revision });
}
