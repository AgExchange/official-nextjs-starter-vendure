'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ResultOf } from '@/graphql';
import { GetTopCollectionsQuery, GetCollectionWithChildrenQuery } from '@/lib/vendure/queries';

type Collection = ResultOf<typeof GetTopCollectionsQuery>['collections']['items'][0];
type CollectionWithChildren = NonNullable<ResultOf<typeof GetCollectionWithChildrenQuery>['collection']>;

interface Breadcrumb {
  id: string;
  name: string;
  slug: string;
}

interface CollectionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  initialCollections: Collection[];
}

export function CollectionsMenu({ isOpen, onClose, initialCollections }: CollectionsMenuProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [currentCollection, setCurrentCollection] = useState<CollectionWithChildren | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTopLevelCollections();
    }
  }, [isOpen]);

  function loadTopLevelCollections() {
    setCurrentCollection(null);
    setBreadcrumbs([]);
    setCollections(initialCollections);
    setError(null);
  }

  async function loadCollectionChildren(collectionId: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections/' + collectionId);
      if (!response.ok) throw new Error('Failed to load collection');

      const collection: CollectionWithChildren = await response.json();

      if (collection) {
        // If collection has no children, navigate to collection page
        if (!collection.children || collection.children.length === 0) {
          handleSelectCollection(collection);
          return;
        }

        setCurrentCollection(collection);
        setBreadcrumbs(collection.breadcrumbs?.filter(b => b.slug !== '__root_collection__') || []);
        setCollections(collection.children || []);
      } else {
        setError('Collection not found');
      }
    } catch (err) {
      console.error('Load collection children error:', err);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }

  const handleCollectionClick = (collection: Collection) => {
    // Load children to see if this collection has sub-collections
    loadCollectionChildren(collection.id);
  };

  const handleSelectCollection = (collection: Collection | CollectionWithChildren) => {
    router.push(`/collection/${collection.slug}`);
    onClose();
  };

  const handleBack = () => {
    if (breadcrumbs.length > 1) {
      // Navigate to parent collection
      const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
      loadCollectionChildren(parentBreadcrumb.id);
    } else {
      // Navigate to top level
      loadTopLevelCollections();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Menu */}
      <div className="fixed left-0 top-0 h-full w-80 bg-background z-50 shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2 flex-1">
              {breadcrumbs.length > 0 && (
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-2xl font-semibold truncate">
                {currentCollection ? currentCollection.name : 'Collections'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="px-6 py-3 border-b bg-muted/30">
              <nav className="flex items-center space-x-1 text-sm overflow-x-auto">
                <button
                  onClick={() => loadTopLevelCollections()}
                  className="text-muted-foreground hover:text-foreground hover:underline whitespace-nowrap"
                >
                  All
                </button>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.id} className="flex items-center space-x-1">
                    <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <button
                      onClick={() => {
                        if (index === breadcrumbs.length - 1) return;
                        loadCollectionChildren(breadcrumb.id);
                      }}
                      className={`whitespace-nowrap ${
                        index === breadcrumbs.length - 1
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:underline'
                      }`}
                      disabled={index === breadcrumbs.length - 1}
                    >
                      {breadcrumb.name}
                    </button>
                  </div>
                ))}
              </nav>
            </div>
          )}

          {/* Current Collection Info & Action */}
          {currentCollection && (
            <div className="px-6 py-4 border-b bg-primary/10">
              <button
                onClick={() => handleSelectCollection(currentCollection)}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                View All Products in {currentCollection.name}
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">{error}</p>
                  <button
                    onClick={() => currentCollection ? loadCollectionChildren(currentCollection.id) : loadTopLevelCollections()}
                    className="mt-3 text-sm text-destructive hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : collections.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No sub-collections available</p>
              </div>
            ) : (
              <nav className="py-2">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleCollectionClick(collection)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors group border-b last:border-0"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      {collection.featuredAsset ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={`${collection.featuredAsset.preview}?preset=thumb&format=webp`}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-muted-foreground text-sm font-medium">
                            {collection.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate group-hover:text-primary transition-colors font-medium">
                          {collection.name}
                        </div>
                        {collection.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {collection.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
