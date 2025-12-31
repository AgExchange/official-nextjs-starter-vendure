'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ResultOf } from '@/graphql';
import { GetTopCollectionsQuery } from '@/lib/vendure/queries';
import { CollectionsNavigation } from '@/components/commerce/collections-navigation';
import { Button } from '@/components/ui/button';

type Collection = ResultOf<typeof GetTopCollectionsQuery>['collections']['items'][0];

interface SearchWrapperProps {
    initialCollections: Collection[];
    children: React.ReactNode;
}

export function SearchWrapper({ initialCollections, children }: SearchWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('q');
    const collectionFilter = searchParams.get('collection');

    const handleCollectionSelect = (collectionSlug: string) => {
        if (collectionSlug) {
            // Navigate to search page with collection filter
            router.push(`/search?collection=${collectionSlug}`);
        } else {
            // Clear collection filter and go back to browsing
            router.push('/search');
        }
    };

    const handleBackToCollections = () => {
        // Reset collection selection to trigger state reset in CollectionsNavigation
        handleCollectionSelect('');
    };

    return (
        <div className="space-y-8">
            {/* Collections Navigation Grid - Always visible, manages its own display logic */}
            <CollectionsNavigation
                initialCollections={initialCollections}
                onCollectionSelect={handleCollectionSelect}
            />

            {/* Back to Collections Button - Only show if filtering by collection (not search term) */}
            {!searchTerm && collectionFilter && (
                <div className="mb-4">
                    <Button
                        variant="ghost"
                        onClick={handleBackToCollections}
                        className="gap-2"
                        aria-label="Return to browsing all collections"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Collections
                    </Button>
                </div>
            )}

            {/* Search Results - Always shown alongside collections */}
            {children}
        </div>
    );
}
