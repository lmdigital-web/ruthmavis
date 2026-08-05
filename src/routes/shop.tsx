import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getProducts, getCategories } from '@/lib/shop.functions';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShoppingBag, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const shopSearchSchema = z.object({
  category: z.string().optional().catch('all'),
  search: z.string().optional().catch(''),
});

export const Route = createFileRoute('/shop')({
  validateSearch: (search) => shopSearchSchema.parse(search),
  component: ShopPage,
});

function ShopPage() {
  const { category = 'all', search = '' } = Route.useSearch();
  const navigate = Route.useNavigate();
  const productsFn = useServerFn(getProducts);
  const categoriesFn = useServerFn(getCategories);
  const [localSearch, setLocalSearch] = useState(search);

  const { data: products } = useSuspenseQuery({
    queryKey: ['products', category, search],
    queryFn: () => productsFn({ data: { category, search } }),
  });

  const { data: categories } = useSuspenseQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesFn(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: (prev) => ({ ...prev, search: localSearch }),
    });
  };

  const handleCategoryChange = (val: string) => {
    navigate({
      search: (prev) => ({ ...prev, category: val }),
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
        <Reveal>
          <SectionHeading 
            title="Our Collection" 
            subtitle="Faith-filled pieces curated with love and intention." 
            align="center"
          />
        </Reveal>

        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Tabs 
            defaultValue={category} 
            onValueChange={handleCategoryChange}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-blush/10 p-1">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.slug}>
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search products..." 
              className="pl-10 border-gold/20 focus-visible:ring-gold"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </form>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product, idx) => (
              <Reveal key={product.id} delay={idx * 0.1}>
                <Link 
                  to="/product/$slug" 
                  params={{ slug: product.slug }}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-gold/5">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {product.stock_quantity < 5 && (
                      <span className="absolute right-3 top-3 rounded-full bg-burgundy/90 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                        Limited Stock
                      </span>
                    )}
                  </div>
                  <div className="mt-5 space-y-1">
                    <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                      {product.categories?.name}
                    </p>
                    <h3 className="font-serif text-lg text-primary transition-colors group-hover:text-burgundy">
                      {product.name}
                    </h3>
                    <p className="font-serif text-xl font-bold text-primary/80">
                      R {product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={48} className="text-gold/20 mb-4" />
              <h3 className="text-xl font-serif text-primary">No products found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or category filters.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setLocalSearch('');
                  handleCategoryChange('all');
                }}
                className="mt-4 text-burgundy"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
