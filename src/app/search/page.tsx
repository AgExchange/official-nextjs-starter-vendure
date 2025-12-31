import type {Metadata} from 'next';
import {Suspense} from 'react';
import {SearchResults} from "@/app/search/search-results";
import {SearchWrapper} from "@/app/search/search-wrapper";
import {SearchTerm, SearchTermSkeleton} from "@/app/search/search-term";
import {SearchResultsSkeleton} from "@/components/shared/skeletons/search-results-skeleton";
import {SITE_NAME, noIndexRobots} from '@/lib/metadata';
import {getTopCollections} from '@/lib/vendure/cached';

export async function generateMetadata({
    searchParams,
}: PageProps<'/search'>): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const searchQuery = resolvedParams.q as string | undefined;

    const title = searchQuery
        ? `Search results for "${searchQuery}"`
        : 'Search Products';

    return {
        title,
        description: searchQuery
            ? `Find products matching "${searchQuery}" at ${SITE_NAME}`
            : `Search our product catalog at ${SITE_NAME}`,
        robots: noIndexRobots(),
    };
}

export default async function SearchPage({searchParams}: PageProps<'/search'>) {
    const collections = await getTopCollections();

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <Suspense fallback={<SearchTermSkeleton/>}>
                <SearchTerm searchParams={searchParams}/>
            </Suspense>
            <SearchWrapper initialCollections={collections}>
                <Suspense fallback={<SearchResultsSkeleton />}>
                    <SearchResults searchParams={searchParams} collections={collections}/>
                </Suspense>
            </SearchWrapper>
        </div>
    );
}
