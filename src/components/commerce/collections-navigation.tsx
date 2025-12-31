'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ResultOf } from '@/graphql';
import { GetTopCollectionsQuery, GetCollectionWithChildrenQuery } from '@/lib/vendure/queries';

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

    async function loadCollectionChildren(collectionId: string) {
        setLoading(true);
        try {
            const response = await fetch(`/api/collections/${collectionId}`);
            if (!response.ok) throw new Error('Failed to load collection');

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
            }
        } catch (err) {
            console.error('Load collection children error:', err);
        } finally {
            setLoading(false);
        }
    }

    function handleCollectionClick(collection: Collection) {
        loadCollectionChildren(collection.id);
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
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {breadcrumbs.length > 0 && (
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                            disabled={loading}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h2 className="text-xl font-semibold">
                        {currentCollection ? currentCollection.name : 'Browse Collections'}
                    </h2>
                </div>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="mb-4" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <button
                                onClick={loadTopLevelCollections}
                                className="text-muted-foreground hover:text-foreground hover:underline"
                                disabled={loading}
                            >
                                All Collections
                            </button>
                        </li>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <li key={breadcrumb.id} className="flex items-center space-x-2">
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                <button
                                    onClick={() => {
                                        if (index === breadcrumbs.length - 1) return;
                                        loadCollectionChildren(breadcrumb.id);
                                    }}
                                    className={`${
                                        index === breadcrumbs.length - 1
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:underline'
                                    }`}
                                    disabled={index === breadcrumbs.length - 1 || loading}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-square bg-muted rounded-lg mb-2"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {collections.map((collection) => (
                        <button
                            key={collection.id}
                            onClick={() => handleCollectionClick(collection)}
                            className="group text-left bg-card rounded-lg overflow-hidden hover:shadow-md transition-shadow border"
                        >
                            <div className="aspect-square bg-muted overflow-hidden">
                                {collection.featuredAsset ? (
                                    <Image
                                        src={`${collection.featuredAsset.preview}?preset=medium&format=webp`}
                                        alt={collection.name}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <span className="text-muted-foreground text-2xl font-semibold">
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
