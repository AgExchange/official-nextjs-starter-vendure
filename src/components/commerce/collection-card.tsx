import Link from 'next/link';
import Image from 'next/image';

interface CollectionCardProps {
    collection: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        featuredAsset?: {
            id: string;
            preview: string;
        } | null;
    };
}

export function CollectionCard({ collection }: CollectionCardProps) {
    return (
        <Link
            href={`/collection/${collection.slug}`}
            className="group relative block max-w-[300px] overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
        >
            {/* Image */}
            <div className="aspect-square relative bg-muted">
                {collection.featuredAsset ? (
                    <Image
                        src={`${collection.featuredAsset.preview}?w=300&h=300&format=webp`}
                        alt={collection.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground">
                            {collection.name.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent opacity-50" aria-hidden="true" />

                {/* Collection Name */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">
                        {collection.name}
                    </h3>
                </div>
            </div>
        </Link>
    );
}
