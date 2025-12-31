'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ResultOf } from '@/graphql';
import { GetTopCollectionsQuery } from '@/lib/vendure/queries';

type Collection = ResultOf<typeof GetTopCollectionsQuery>['collections']['items'][0];

interface CollectionsNavigationProps {
    collections: Collection[];
    title?: string;
}

export function CollectionsNavigation({ collections, title = 'Browse Collections' }: CollectionsNavigationProps) {
    if (collections.length === 0) {
        return null;
    }

    return (
        <div className="mb-8 pb-6 border-b">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {collections.map((collection) => (
                    <Link
                        key={collection.id}
                        href={`/collection/${collection.slug}`}
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
                    </Link>
                ))}
            </div>
        </div>
    );
}
