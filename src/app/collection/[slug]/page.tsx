import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { query } from '@/lib/vendure/api';
import { SearchProductsQuery, GetCollectionProductsQuery } from '@/lib/vendure/queries';
import { ProductGrid } from '@/components/commerce/product-grid';
import { FacetFilters } from '@/components/commerce/facet-filters';
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton';
import { CollectionCard } from '@/components/commerce/collection-card';
import { buildSearchInput, getCurrentPage } from '@/lib/search-helpers';
import { cacheLife, cacheTag } from 'next/cache';
import {
    SITE_NAME,
    truncateDescription,
    buildCanonicalUrl,
    buildOgImages,
} from '@/lib/metadata';

async function getCollectionProducts(slug: string, searchParams: { [key: string]: string | string[] | undefined }) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-${slug}`);

    return query(SearchProductsQuery, {
        input: buildSearchInput({
            searchParams,
            collectionSlug: slug
        })
    });
}

async function getCollectionMetadata(slug: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-meta-${slug}`);

    return query(GetCollectionProductsQuery, {
        slug,
        input: { take: 0, collectionSlug: slug, groupByProduct: true },
    });
}

export async function generateMetadata({
    params,
}: PageProps<'/collection/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const result = await getCollectionMetadata(slug);
    const collection = result.data.collection;

    if (!collection) {
        return {
            title: 'Collection Not Found',
        };
    }

    const description =
        truncateDescription(collection.description) ||
        `Browse our ${collection.name} collection at ${SITE_NAME}`;

    return {
        title: collection.name,
        description,
        alternates: {
            canonical: buildCanonicalUrl(`/collection/${collection.slug}`),
        },
        openGraph: {
            title: collection.name,
            description,
            type: 'website',
            url: buildCanonicalUrl(`/collection/${collection.slug}`),
            images: buildOgImages(collection.featuredAsset?.preview, collection.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: collection.name,
            description,
            images: collection.featuredAsset?.preview
                ? [collection.featuredAsset.preview]
                : undefined,
        },
    };
}

export default async function CollectionPage({params, searchParams}: PageProps<'/collection/[slug]'>) {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;
    const page = getCurrentPage(searchParamsResolved);

    const productDataPromise = getCollectionProducts(slug, searchParamsResolved);
    const metadataResult = await getCollectionMetadata(slug);
    const collection = metadataResult.data.collection;

    if (!collection) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="text-center py-16">
                    <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
                    <p className="text-muted-foreground">The collection you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const breadcrumbs = collection.breadcrumbs?.filter(b => b.slug !== '__root_collection__') || [];

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <li>
                            <Link href="/" className="hover:text-foreground hover:underline">
                                Home
                            </Link>
                        </li>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <li key={breadcrumb.id} className="flex items-center space-x-2">
                                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="text-foreground font-medium" aria-current="page">
                                        {breadcrumb.name}
                                    </span>
                                ) : (
                                    <Link
                                        href={`/collection/${breadcrumb.slug}`}
                                        className="hover:text-foreground hover:underline"
                                    >
                                        {breadcrumb.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            {/* Collection Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
                {collection.description && (
                    <p className="text-muted-foreground">{collection.description}</p>
                )}
            </div>

            {/* Child Collections */}
            {collection.children && collection.children.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {collection.children.map((child) => (
                            <CollectionCard key={child.id} collection={child} />
                        ))}
                    </div>
                </div>
            )}

            {/* Products Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                        <FacetFilters productDataPromise={productDataPromise} />
                    </Suspense>
                </aside>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                    <Suspense fallback={<ProductGridSkeleton />}>
                        <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}