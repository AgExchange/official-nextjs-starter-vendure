'use client';

import {Suspense, useState, useEffect} from "react";
import {use} from "react";
import {FacetFilters} from "@/components/commerce/facet-filters";
import {ProductGridSkeleton} from "@/components/shared/product-grid-skeleton";
import {ProductGrid} from "@/components/commerce/product-grid";
import {buildSearchInput, getCurrentPage} from "@/lib/search-helpers";
import {query} from "@/lib/vendure/api";
import {SearchProductsQuery} from "@/lib/vendure/queries";
import {CollectionsMenuTrigger} from "@/components/commerce/collections-menu-trigger";
import {CollectionsNavigation} from "@/components/commerce/collections-navigation";
import {ResultOf} from "@/graphql";
import {GetTopCollectionsQuery} from "@/lib/vendure/queries";

type Collection = ResultOf<typeof GetTopCollectionsQuery>['collections']['items'][0];

interface SearchResultsProps {
    searchParams: Promise<{
        page?: string;
        q?: string;
    }>;
    collectionsPromise: Promise<Collection[]>;
}

export function SearchResults({searchParams, collectionsPromise}: SearchResultsProps) {
    const searchParamsResolved = use(searchParams);
    const collections = use(collectionsPromise);
    const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string>('');
    const [showResults, setShowResults] = useState(false);

    const page = getCurrentPage(searchParamsResolved);

    // Show results if there's a search term or selected collection
    useEffect(() => {
        setShowResults(!!searchParamsResolved.q || !!selectedCollectionSlug);
    }, [searchParamsResolved.q, selectedCollectionSlug]);

    const handleCollectionSelect = (collectionSlug: string) => {
        setSelectedCollectionSlug(collectionSlug);
        setShowResults(!!collectionSlug);
    };

    const productDataPromise = query(SearchProductsQuery, {
        input: buildSearchInput({
            searchParams: searchParamsResolved,
            collectionSlug: selectedCollectionSlug || undefined
        })
    });

    const handleBackToCollections = () => {
        setSelectedCollectionSlug('');
        setShowResults(false);
    };

    return (
        <div className="space-y-8">
            {/* Collections Navigation Grid - Hidden when showing search results */}
            {!showResults && (
                <CollectionsNavigation
                    initialCollections={collections}
                    onCollectionSelect={handleCollectionSelect}
                />
            )}

            {/* Search Results Grid - Only shown when a collection is selected or search term exists */}
            {showResults && (
                <>
                    {/* Back to Collections Button - Only show if navigated via collections (not search term) */}
                    {selectedCollectionSlug && !searchParamsResolved.q && (
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

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <aside className="lg:col-span-1 space-y-6">
                            {/* Collections Menu Trigger */}
                            <CollectionsMenuTrigger collections={collections} />

                            {/* Facet Filters */}
                            <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg"/>}>
                                <FacetFilters productDataPromise={productDataPromise} />
                            </Suspense>
                        </aside>

                        {/* Product Grid */}
                        <div className="lg:col-span-3">
                            <Suspense fallback={<ProductGridSkeleton/>}>
                                <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12}/>
                            </Suspense>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}