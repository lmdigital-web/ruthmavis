import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getProducts, getCategories } from '@/lib/shop.functions';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

const shopSearchSchema = z.object({
  category: z.string().optional().catch('all'),
  search: z.string().optional().catch(''),
  sort: z.enum(['newest', 'price-low', 'price-high', 'name-az', 'name-za']).optional().catch('newest'),
});

const categoryOrder = [
  'bibles',
  'bible-combos',
  'crochet-bags',
  'devotions',
  'bible-bags',
  'journals',
  'other-accessories',
];

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-az', label: 'Name: A to Z' },
  { value: 'name-za', label: 'Name: Z to A' },
] as const;

export const Route = createFileRoute('/shop')({
  validateSearch: (search) => shopSearchSchema.parse(search),
  component: ShopPage,
});

function ShopPage() {
  const { category = 'all', search = '', sort = 'newest' } = Route.useSearch();
  const navigate = Route.useNavigate();
  const productsFn = useServerFn(getProducts);
  const categoriesFn = useServerFn(getCategories);
  const [localSearch, setLocalSearch] = useState(search);

  const { data: products } = useSuspenseQuery({
    queryKey: ['products', category, search, sort],
    queryFn: () => productsFn({ data: { category, search, sort } }),
  });

  const { data: categories } = useSuspenseQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesFn(),
  });

  const orderedCategories = categoryOrder
    .map((slug) => categories.find((cat: any) => cat.slug === slug))
    .filter(Boolean);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: (prev: any) => ({ ...prev, search: localSearch || undefined }),
    });
  };

  const handleCategoryChange = (val: string) => {
    navigate({
      search: (prev: any) => ({ ...prev, category: val === 'all' ? undefined : val }),
    });
  };

  const handleSortChange = (val: string) => {
    navigate({
      search: (prev: any) => ({ ...prev, sort: val === 'newest' ? undefined : val }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:py-12">
        <Reveal>
          <SectionHeading
            title="Our Collection"
            subtitle="Faith-filled pieces curated with love and intention."
            align="center"
          />
        </Reveal>

        <div className="mt-10 rounded-2xl border border-gold/10 bg-card/50 p-4 shadow-sm md:mt-12 md:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <SlidersHorizontal size={17} className="text-gold" />
            Shop by category
          </div>

          <div className="mt-4 -mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2 px-1">
              <Button
                type="button"
                variant={category === 'all' ? 'default' : 'outline'}
                onClick={() => handleCategoryChange('all')}
                className={category === 'all' ? 'bg-primary text-primary-foreground' : 'border-gold/20'}
              >
                All Products
              </Button>
              {orderedCategories.map((cat: any) => (
                <Button
                  key={cat.id}
                  type="button"
                  variant={category === cat.slug ? 'default' : 'outline'}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={category === cat.slug ? 'bg-primary text-primary-foreground' : 'border-gold/20'}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gold/10 bg-background/80 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'}
            {category !== 'all' && orderedCategories.find((cat: any) => cat.slug === category)
              ? ` in ${orderedCategories.find((cat: any) => cat.slug === category)?.name}`
              : ''}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <form onSubmit={handleSearch} className="relative w-full sm:min-w-[280px] md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search products..."
                className="border-gold/20 pl-10 focus-visible:ring-gold"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </form>

            <label className="flex items-center gap-2 rounded-md border border-gold/20 bg-background px-3 focus-within:ring-2 focus-within:ring-gold/30">
              <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">Sort by</span>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-10 min-w-[170px] bg-transparent text-sm text-primary outline-none"
                aria-label="Sort products"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products && products.length > 0 ? (
            products.map((product: any, idx: number) => (
              <Reveal key={product.id} delay={idx * 0.1}>
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-gold/5">
                    <img
                      src={product.image_url ?? undefined}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {product.stock_quantity <= 0 && (
                      <span className="absolute right-3 top-3 rounded-full bg-burgundy/90 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                        Sold Out
                      </span>
                    )}
                  </div>
                  <div className="mt-5 space-y-1">
                    <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                      {product.categories?.name || 'Uncategorized'}
                    </p>
                    <h3 className="line-clamp-1 font-serif text-lg text-primary transition-colors group-hover:text-burgundy">
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
              <ShoppingBag size={48} className="mb-4 text-gold/20" />
              <h3 className="font-serif text-xl text-primary">No products found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your search or category filters.</p>
              <Button
                variant="link"
                onClick={() => {
                  setLocalSearch('');
                  navigate({ search: {} });
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
