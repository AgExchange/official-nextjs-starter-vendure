import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
} from '@/components/ui/navigation-menu';
import {NavbarLink} from '@/components/layout/navbar/navbar-link';
import {getTopCollections} from '@/lib/vendure/cached';

export async function NavbarCollections() {
    const collections = await getTopCollections();

    return (
        <NavigationMenu>
            <NavigationMenuList className="flex-row gap-2">
                {collections.slice(0, 6).map((collection) => (
                    <NavigationMenuItem key={collection.id}>
                        <NavbarLink href={`/collection/${collection.slug}`}>
                            {collection.name}
                        </NavbarLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
