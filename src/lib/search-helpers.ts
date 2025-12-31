export interface SearchInputParams {
    term?: string;
    collectionSlug?: string;
    take: number;
    skip: number;
    groupByProduct: boolean;
    sort: { name?: 'ASC' | 'DESC'; price?: 'ASC' | 'DESC' };
    facetValueFilters?: Array<{ and: string }>;
}

interface BuildSearchInputOptions {
    searchParams: { [key: string]: string | string[] | undefined };
    collectionSlug?: string;
}

export function buildSearchInput({ searchParams, collectionSlug }: BuildSearchInputOptions): SearchInputParams {
    const page = Number(searchParams.page) || 1;
    const take = 12;
    const skip = (page - 1) * take;
    const sort = (searchParams.sort as string) || 'name-asc';
    const searchTerm = searchParams.q as string;

    // Extract facet value IDs from search params
    const facetValueIds = searchParams.facets
        ? Array.isArray(searchParams.facets)
            ? searchParams.facets
            : [searchParams.facets]
        : [];

    // Extract collection slugs from search params (for filter selections)
    const collectionSlugs = searchParams.collection
        ? Array.isArray(searchParams.collection)
            ? searchParams.collection
            : [searchParams.collection]
        : [];

    // Use the first selected collection slug (Vendure search supports single collection)
    // If multiple collections are selected, we use the first one
    const activeCollectionSlug = collectionSlug || (collectionSlugs.length > 0 ? collectionSlugs[0] : undefined);

    // Map sort parameter to Vendure SearchResultSortParameter
    const sortMapping: Record<string, { name?: 'ASC' | 'DESC'; price?: 'ASC' | 'DESC' }> = {
        'name-asc': { name: 'ASC' },
        'name-desc': { name: 'DESC' },
        'price-asc': { price: 'ASC' },
        'price-desc': { price: 'DESC' },
    };

    return {
        ...(searchTerm && { term: searchTerm }),
        ...(activeCollectionSlug && { collectionSlug: activeCollectionSlug }),
        take,
        skip,
        groupByProduct: true,
        sort: sortMapping[sort] || sortMapping['name-asc'],
        ...(facetValueIds.length > 0 && {
            facetValueFilters: facetValueIds.map(id => ({ and: id }))
        })
    };
}

export function getCurrentPage(searchParams: { [key: string]: string | string[] | undefined }): number {
    return Number(searchParams.page) || 1;
}
