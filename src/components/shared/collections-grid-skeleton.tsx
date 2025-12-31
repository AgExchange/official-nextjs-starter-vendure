export function CollectionsGridSkeleton() {
    return (
        <div className="mb-8 pb-6 border-b">
            {/* Header skeleton */}
            <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-48 bg-muted animate-pulse rounded" />
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-lg overflow-hidden border">
                        <div className="aspect-square bg-muted animate-pulse" />
                        <div className="p-2">
                            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
