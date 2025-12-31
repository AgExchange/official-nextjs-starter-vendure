import { NextRequest, NextResponse } from 'next/server';
import { getCollectionWithChildren } from '@/lib/vendure/cached';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('[API] Fetching collection with ID:', id);

        const collection = await getCollectionWithChildren({ id });
        console.log('[API] Collection result:', collection ? 'Found' : 'Not found');

        if (!collection) {
            console.warn('[API] Collection not found for ID:', id);
            return NextResponse.json(
                { error: `Collection not found for ID: ${id}` },
                { status: 404 }
            );
        }

        return NextResponse.json(collection);
    } catch (error) {
        console.error('[API] Error fetching collection:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch collection';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
