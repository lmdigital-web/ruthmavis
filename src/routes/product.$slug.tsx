import { createFileRoute, useRouter } from '@tanstack/react-router';
import DOMPurify from 'dompurify';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getProductBySlug, getProductVariants, uploadCustomFile } from '@/lib/shop.functions';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ChevronLeft, ShieldCheck, Truck, RotateCcw, Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/product/$slug')({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const productFn = useServerFn(getProductBySlug);
  const variantsFn = useServerFn(getProductVariants);
  const uploadFn = useServerFn(uploadCustomFile);
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customFile, setCustomFile] = useState<{ name: string; url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: product } = useSuspenseQuery({
    queryKey: ['product', slug],
    queryFn: () => productFn({ data: slug }),
  });

  const { data: variants } = useSuspenseQuery({
    queryKey: ['variants', product.id],
    queryFn: () => variantsFn({ data: product.id }),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const result = await uploadFn({ 
          data: { 
            fileName: file.name, 
            fileBase64: base64,
          } 
        });
        setCustomFile({ name: file.name, url: result.url });
        toast.success('Design uploaded successfully!');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload file');
      setUploading(false);
    }
  };

  const getVariantLabel = (variant: any) => {
    const parts = [];
    if (variant.size) parts.push(variant.size);
    if (variant.color) parts.push(variant.color);
    return parts.join(' - ') || `Variant ${variant.sku}`;
  };

  const selectedVariantData = variants?.find((v: any) => v.id === selectedVariant);
  const variantPrice = selectedVariantData?.price_modifier || 0;
  const finalPrice = product.price + variantPrice;

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      image_url: product.image_url ?? '',
      slug: product.slug,
      ...(selectedVariant && {
        variantId: selectedVariant,
        variantLabel: getVariantLabel(selectedVariantData),
      }),
      ...(customFile && {
        customFileUrl: customFile.url,
        customFileName: customFile.name,
      }),
    };
    addToCart(cartItem as any, quantity);
    toast.success(`${product.name} added to your bag!`);
  };

  return (
    <div className="min-h-screen bg-background pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
        <button 
          onClick={() => router.history.back()}
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Collection
        </button>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image Gallery */}
          <Reveal>
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-xl ring-1 ring-gold/10 group">
                <img
                  src={
                    product.product_images && product.product_images.length > 0
                      ? product.product_images[activeImageIndex].url
                      : (product.image_url ?? undefined)
                  }
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              {/* Thumbnails */}
              {product.product_images && product.product_images.length > 1 && (
                <div className="flex flex-wrap gap-3">
                  {product.product_images.map((img: any, index: number) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        "relative w-20 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all",
                        activeImageIndex === index 
                          ? "border-burgundy shadow-md scale-105" 
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
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

              <div className="prose prose-stone max-w-none">
                <div 
                  className="text-lg leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(product.description ?? '') : (product.description ?? '') }}
                />
              </div>

              {/* Variants Section */}
              {variants && variants.length > 0 && (
                <div className="space-y-4 pt-6">
                  <h3 className="font-serif text-lg font-semibold text-primary">Choose Variant</h3>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedVariant === variant.id
                            ? 'border-burgundy bg-burgundy/10 text-burgundy'
                            : 'border-gold/20 bg-white text-muted-foreground hover:border-gold/50'
                        } ${variant.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={variant.stock_quantity === 0}
                      >
                        <div>{getVariantLabel(variant)}</div>
                        {variant.price_modifier !== 0 && (
                          <div className="text-xs text-gold">
                            {variant.price_modifier > 0 ? '+' : ''} R {variant.price_modifier.toFixed(2)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}


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
                    disabled={product.stock_quantity <= 0}
                    className="flex-1 h-14 bg-burgundy hover:bg-burgundy/90 text-burgundy-foreground text-lg gap-2"
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
