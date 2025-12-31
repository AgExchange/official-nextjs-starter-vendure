import { NextRequest, NextResponse } from 'next/server';
import { getCollectionWithChildren } from '@/lib/vendure/cached';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('[API] Fetching collection with ID/Slug:', id);

        // Try as ID first, then as slug
        let collection = await getCollectionWithChildren({ id });

        if (!collection) {
            console.log('[API] Not found by ID, trying as slug:', id);
            collection = await getCollectionWithChildren({ slug: id });
        }

        console.log('[API] Collection result:', collection ? 'Found' : 'Not found');

        if (!collection) {
            console.warn('[API] Collection not found for ID/Slug:', id);
            return NextResponse.json(
                { error: `Collection not found for ID/Slug: ${id}` },
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
