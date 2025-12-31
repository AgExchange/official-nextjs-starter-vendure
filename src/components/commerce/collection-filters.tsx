'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Collection {
    id: string;
    name: string;
    slug: string;
}

interface CollectionFiltersProps {
    collections: Collection[];
}

export function CollectionFilters({ collections }: CollectionFiltersProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const selectedCollections = searchParams.getAll('collection');

    const toggleCollection = (collectionSlug: string) => {
        const params = new URLSearchParams(searchParams);
        const current = params.getAll('collection');

        if (current.includes(collectionSlug)) {
            params.delete('collection');
            current.filter(slug => slug !== collectionSlug).forEach(slug => params.append('collection', slug));
        } else {
            params.append('collection', collectionSlug);
        }

        // Reset to page 1 when filters change
        params.delete('page');

        router.push(`${pathname}?${params.toString()}`);
    };

    if (collections.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h3 className="font-medium text-sm">Collections</h3>
            <div className="space-y-2">
                {collections.map((collection) => {
                    const isChecked = selectedCollections.includes(collection.slug);
                    return (
                        <div key={collection.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={collection.slug}
                                checked={isChecked}
                                onCheckedChange={() => toggleCollection(collection.slug)}
                            />
                            <Label
                                htmlFor={collection.slug}
                                className="text-sm font-normal cursor-pointer"
                            >
                                {collection.name}
                            </Label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
