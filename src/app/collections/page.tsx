import type { Metadata } from 'next';
import Link from 'next/link';
import { getTopCollections } from '@/lib/vendure/cached';
import { SITE_NAME } from '@/lib/metadata';

export const metadata: Metadata = {
    title: 'Collections',
    description: `Browse our product collections at ${SITE_NAME}`,
};

export default async function CollectionsPage() {
    const collections = await getTopCollections();

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Collections</h1>
                <p className="text-muted-foreground">
                    Explore our curated collections of products
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collections.map((collection) => (
                    <Link
                        key={collection.id}
                        href={`/collection/${collection.slug}`}
                        className="group block bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all"
                    >
                        <div className="aspect-square relative overflow-hidden bg-muted">
                            {collection.featuredAsset ? (
                                <img
                                    src={`${collection.featuredAsset.preview}?preset=medium&format=webp`}
                                    alt={collection.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-6xl font-bold text-muted-foreground">
                                        {collection.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                                {collection.name}
                            </h2>
                            {collection.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {collection.description}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {collections.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">No collections available yet.</p>
                </div>
            )}
        </div>
    );
}
