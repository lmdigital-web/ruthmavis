import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getProductBySlug } from '@/lib/shop.functions';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ChevronLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

export const Route = createFileRoute('/product/$slug')({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const productFn = useServerFn(getProductBySlug);
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product } = useSuspenseQuery({
    queryKey: ['product', slug],
    queryFn: () => productFn({ data: slug }),
  });

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      slug: product.slug,
    }, quantity);
    toast.success(`${product.name} added to your bag!`);
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
        <button 
          onClick={() => router.history.back()}
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Collection
        </button>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-xl ring-1 ring-gold/10">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>

          {/* Product Info */}
          <Reveal delay={0.2}>
            <div className="flex flex-col space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blush/20 text-burgundy border-transparent px-3 py-1 uppercase tracking-widest text-[10px]">
                    {product.categories?.name}
                  </Badge>
                  {product.stock_quantity > 0 ? (
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50/50">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
                <h1 className="font-serif text-4xl leading-tight text-primary md:text-5xl">
                  {product.name}
                </h1>
                <p className="font-serif text-3xl font-bold text-burgundy">
                  R {product.price.toFixed(2)}
                </p>
              </div>

              <div className="prose prose-stone">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>

              <div className="space-y-6 pt-6 border-t border-gold/10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-gold/30 bg-white p-1">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gold/10 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gold/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <Button 
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 h-14 bg-burgundy hover:bg-burgundy/90 text-lg gap-2"
                  >
                    <ShoppingBag size={20} />
                    Add to Bag
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-8 md:grid-cols-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="rounded-full bg-gold/10 p-2 text-gold">
                      <ShieldCheck size={18} />
                    </div>
                    Hand-crafted Quality
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="rounded-full bg-gold/10 p-2 text-gold">
                      <Truck size={18} />
                    </div>
                    SA-wide Delivery
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="rounded-full bg-gold/10 p-2 text-gold">
                      <RotateCcw size={18} />
                    </div>
                    Secure Payment
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
