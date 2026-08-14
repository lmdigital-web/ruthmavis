import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getWooProductBySlug as getProductBySlug, getWooProductVariations as getProductVariants, uploadCustomFile } from '@/lib/woocommerce.functions';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ChevronLeft, ShieldCheck, Truck, RotateCcw, Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

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
            userId: 'customer' // This would be auth.uid() in a real app
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
      image_url: product.image_url,
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
                  {product.in_stock ? (
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
                  dangerouslySetInnerHTML={{ __html: product.description }}
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

              {/* File Upload Section */}
              <div className="space-y-4 pt-6">
                <h3 className="font-serif text-lg font-semibold text-primary">Add Custom Design (Optional)</h3>
                <div className="space-y-3">
                  {customFile ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Upload size={18} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">{customFile.name}</p>
                          <p className="text-xs text-green-700">Ready for production</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCustomFile(null)}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                      >
                        <X size={16} className="text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gold/30 rounded-lg cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all">
                      <Upload size={24} className="text-gold mb-2" />
                      <span className="text-sm font-medium text-gold">Click to upload design</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
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
                    disabled={!product.in_stock}
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
