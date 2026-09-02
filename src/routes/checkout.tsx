import { createFileRoute, Link } from '@tanstack/react-router';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const WOOCOMMERCE_CHECKOUT_LINK =
  'https://shop.ruthmavisaccessories.co.za/checkout-link/';

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const cartTotalPrice = totalPrice();
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);

    try {
      const unmappedProduct = items.find(
        (item) => !item.woocommerce_product_id
      );

      if (unmappedProduct) {
        throw new Error(
          `"${unmappedProduct.name}" is not yet connected to WooCommerce.`
        );
      }

      /*
       * WooCommerce Checkout Link format:
       *
       * products=PRODUCT_ID:QUANTITY,PRODUCT_ID:QUANTITY
       *
       * Example:
       * products=21:1,22:2
       */
      const products = items
        .map(
          (item) =>
            `${item.woocommerce_product_id}:${Math.max(
              1,
              item.quantity
            )}`
        )
        .join(',');

      const checkoutUrl = `${WOOCOMMERCE_CHECKOUT_LINK}?products=${encodeURIComponent(
        products
      )}`;

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('WooCommerce checkout error:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to start checkout. Please try again.'
      );

      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h2 className="text-2xl font-serif text-primary">
          Your bag is empty
        </h2>

        <Button asChild className="mt-6 bg-burgundy">
          <Link to="/shop">Go Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-10 lg:py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-burgundy">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review your order before continuing to secure checkout.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <div className="rounded-xl border border-gray-200 p-6">
              <h2 className="mb-6 text-lg font-medium">
                Your Order
              </h2>

              <div className="space-y-5">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.variantId || 'base'}`}
                    className="flex items-center gap-4"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                      <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 p-0 text-[10px] text-white">
                        {item.quantity}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-medium">
                        {item.name}
                      </h3>

                      {item.variantLabel && (
                        <p className="mt-1 text-xs text-gray-500">
                          {item.variantLabel}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <span className="text-sm font-medium">
                      R {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-6">
              <div className="flex items-start gap-3">
                <ShoppingBag className="mt-0.5 h-5 w-5 text-burgundy" />

                <div>
                  <h3 className="font-medium text-gray-900">
                    Secure checkout
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    Your delivery details and payment will be handled
                    securely by Ruth Mavis Accessories' online store.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-6 text-lg font-medium">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>

                  <span className="font-medium text-gray-900">
                    R {cartTotalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>

                  <span className="text-gray-500">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">
                  Total
                </span>

                <div className="text-right">
                  <span className="mr-2 text-xs text-gray-500">
                    ZAR
                  </span>

                  <span className="text-2xl font-bold">
                    R {cartTotalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="mt-6 w-full bg-burgundy py-6 text-base font-medium hover:bg-burgundy/90"
              >
                {loading
                  ? 'Preparing checkout...'
                  : 'Continue to secure checkout'}
              </Button>

              <Link
                to="/shop"
                className="mt-5 flex items-center justify-center gap-1 text-sm text-burgundy"
              >
                <ChevronLeft className="h-4 w-4" />
                Return to shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}