import { getTopCollections } from '@/lib/vendure/cached';
import { CollectionFilters } from './collection-filters';

export async function CollectionFiltersWrapper() {
    const collections = await getTopCollections();

    return <CollectionFilters collections={collections} />;
}
