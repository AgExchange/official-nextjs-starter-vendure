'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { ResultOf } from '@/graphql';
import { GetTopCollectionsQuery, GetCollectionWithChildrenQuery } from '@/lib/vendure/queries';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CollectionsGridSkeleton } from '@/components/shared/collections-grid-skeleton';
import { useSearchParams } from 'next/navigation';

type Collection = ResultOf<typeof GetTopCollectionsQuery>['collections']['items'][0];
type CollectionWithChildren = NonNullable<ResultOf<typeof GetCollectionWithChildrenQuery>['collection']>;

interface Breadcrumb {
    id: string;
    name: string;
    slug: string;
}

interface CollectionsNavigationProps {
    initialCollections: Collection[];
    onCollectionSelect?: (collectionSlug: string) => void;
}

export function CollectionsNavigation({ initialCollections, onCollectionSelect }: CollectionsNavigationProps) {
    const [collections, setCollections] = useState<Collection[]>(initialCollections);
    const [currentCollection, setCurrentCollection] = useState<CollectionWithChildren | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const collectionParam = searchParams.get('collection');

    // Reset to top level when collection parameter is removed
    useEffect(() => {
        if (!collectionParam && currentCollection) {
            // URL has no collection param but we have state - reset to top level
            setCurrentCollection(null);
            setBreadcrumbs([]);
            setCollections(initialCollections);
        }
    }, [collectionParam, currentCollection, initialCollections]);

    async function loadCollectionChildren(collectionId: string, collectionSlug?: string) {
        setLoading(true);
        setError(null);
        try {
            // Try with ID first, then fallback to slug if provided
            let response = await fetch(`/api/collections/${collectionId}`);

            // If ID fails and we have a slug, try with slug
            if (!response.ok && collectionSlug) {
                console.warn(`Collection ID ${collectionId} not found, trying with slug: ${collectionSlug}`);
                response = await fetch(`/api/collections/${collectionSlug}`);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('API Error:', response.status, errorData);
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const collection: CollectionWithChildren = await response.json();

            if (collection) {
                // Always trigger search for this collection (products shown at every level)
                if (onCollectionSelect) {
                    onCollectionSelect(collection.slug);
                }

                // Update navigation state
                setCurrentCollection(collection);
                setBreadcrumbs(collection.breadcrumbs?.filter(b => b.slug !== '__root_collection__') || []);
                setCollections(collection.children || []);
            } else {
                throw new Error('Collection data is empty');
            }
        } catch (err) {
            console.error('Load collection children error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unable to load collection';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    function handleCollectionClick(collection: Collection) {
        loadCollectionChildren(collection.id, collection.slug);
    }

    function handleBack() {
        if (breadcrumbs.length > 1) {
            const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
            loadCollectionChildren(parentBreadcrumb.id);
        } else {
            loadTopLevelCollections();
        }
    }

    function loadTopLevelCollections() {
        setCurrentCollection(null);
        setBreadcrumbs([]);
        setCollections(initialCollections);
        if (onCollectionSelect) {
            onCollectionSelect('');
        }
    }

    // Only hide if we have no collections to show
    // At top level (no currentCollection): always show initial collections
    // At a sub-level (has currentCollection): only show if there are sub-collections
    if (collections.length === 0 && currentCollection) {
        // We're at a leaf collection with no children - hide the navigation
        return null;
    }

    return (
        <div className="mb-8 pb-6 border-b">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle />
                    <AlertTitle>Failed to Load Collection</AlertTitle>
                    <AlertDescription>
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="underline ml-2 hover:no-underline"
                        >
                            Dismiss
                        </button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Header with back button */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {breadcrumbs.length > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            disabled={loading}
                            aria-label="Go back to parent collection"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </Button>
                    )}
                    <h2 className="text-xl font-semibold">
                        {currentCollection ? currentCollection.name : 'Browse Collections'}
                    </h2>
                </div>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="mb-4" aria-label="Collection breadcrumb navigation">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <button
                                onClick={loadTopLevelCollections}
                                className="text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
                                disabled={loading}
                                aria-label="Navigate to all collections"
                            >
                                All Collections
                            </button>
                        </li>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <li key={breadcrumb.id} className="flex items-center space-x-2">
                                <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                <button
                                    onClick={() => {
                                        if (index === breadcrumbs.length - 1) return;
                                        loadCollectionChildren(breadcrumb.id);
                                    }}
                                    className={`rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        index === breadcrumbs.length - 1
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:underline'
                                    }`}
                                    disabled={index === breadcrumbs.length - 1 || loading}
                                    aria-label={`Navigate to ${breadcrumb.name} collection`}
                                    aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                                >
                                    {breadcrumb.name}
                                </button>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            {/* Collections Grid */}
            {loading ? (
                <CollectionsGridSkeleton />
            ) : collections.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg mb-2">No collections available</p>
                    <p className="text-sm">Try browsing other categories or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {collections.map((collection) => (
                        <button
                            key={collection.id}
                            onClick={() => handleCollectionClick(collection)}
                            className="group text-left bg-card rounded-lg overflow-hidden hover:shadow-md transition-shadow border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={`Browse ${collection.name} collection`}
                        >
                            <div className="aspect-square bg-muted overflow-hidden">
                                {collection.featuredAsset ? (
                                    <Image
                                        src={`${collection.featuredAsset.preview}?preset=medium&format=webp`}
                                        alt={`${collection.name} category image`}
                                        width={200}
                                        height={200}
                                        loading="lazy"
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <span className="text-muted-foreground text-2xl font-semibold" aria-hidden="true">
                                            {collection.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-2">
                                <h3 className="text-xs font-medium group-hover:underline line-clamp-2">
                                    {collection.name}
                                </h3>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
