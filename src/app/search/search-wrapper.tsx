'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResultOf } from '@/graphql';
import { GetTopCollectionsQuery } from '@/lib/vendure/queries';
import { CollectionsNavigation } from '@/components/commerce/collections-navigation';

type Collection = ResultOf<typeof GetTopCollectionsQuery>['collections']['items'][0];

interface SearchWrapperProps {
    initialCollections: Collection[];
    children: React.ReactNode;
}

export function SearchWrapper({ initialCollections, children }: SearchWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showResults, setShowResults] = useState(false);
    const searchTerm = searchParams.get('q');
    const collectionFilter = searchParams.get('collection');

    useEffect(() => {
        // Show results if there's a search term OR a collection filter
        setShowResults(!!(searchTerm || collectionFilter));
    }, [searchTerm, collectionFilter]);

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
        router.push('/search');
    };

    return (
        <div className="space-y-8">
            {/* Collections Navigation Grid - Hidden when showing search results */}
            {!showResults && (
                <CollectionsNavigation
                    initialCollections={initialCollections}
                    onCollectionSelect={handleCollectionSelect}
                />
            )}

            {/* Search Results - Only shown when there's a search term or collection filter */}
            {showResults && (
                <>
                    {/* Back to Collections Button - Only show if no search term */}
                    {!searchTerm && collectionFilter && (
                        <div className="mb-4">
                            <button
                                onClick={handleBackToCollections}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Back to Collections
                            </button>
                        </div>
                    )}
                    {children}
                </>
            )}
        </div>
    );
}
