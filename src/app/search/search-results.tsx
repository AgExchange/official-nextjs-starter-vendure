import {Suspense} from "react";
import {FacetFilters} from "@/components/commerce/facet-filters";
import {ProductGridSkeleton} from "@/components/shared/product-grid-skeleton";
import {ProductGrid} from "@/components/commerce/product-grid";
import {buildSearchInput, getCurrentPage} from "@/lib/search-helpers";
import {query} from "@/lib/vendure/api";
import {SearchProductsQuery} from "@/lib/vendure/queries";
import {getTopCollections} from "@/lib/vendure/cached";
import {CollectionsMenuTrigger} from "@/components/commerce/collections-menu-trigger";
import {CollectionsNavigation} from "@/components/commerce/collections-navigation";

interface SearchResultsProps {
    searchParams: Promise<{
        page?: string
    }>
}

export async function SearchResults({searchParams}: SearchResultsProps) {
    const searchParamsResolved = await searchParams;
    const page = getCurrentPage(searchParamsResolved);

    const productDataPromise = query(SearchProductsQuery, {
        input: buildSearchInput({searchParams: searchParamsResolved})
    });

    // Fetch collections with caching
    const collections = await getTopCollections();

    return (
        <div className="space-y-8">
            {/* Collections Navigation Grid */}
            <CollectionsNavigation collections={collections} />

            {/* Search Results Grid */}
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
        </div>
    )
}