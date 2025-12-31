'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CollectionsMenu } from './collections-menu';
import { ResultOf } from '@/graphql';
import { GetTopCollectionsQuery } from '@/lib/vendure/queries';

type Collection = ResultOf<typeof GetTopCollectionsQuery>['collections']['items'][0];

interface CollectionsMenuTriggerProps {
    collections: Collection[];
}

export function CollectionsMenuTrigger({ collections }: CollectionsMenuTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                        </svg>
                    </div>
                    <div className="text-left">
                        <div className="font-semibold">Browse Collections</div>
                        <div className="text-sm text-muted-foreground">
                            Explore categories
                        </div>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            <CollectionsMenu
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                initialCollections={collections}
            />
        </>
    );
}
