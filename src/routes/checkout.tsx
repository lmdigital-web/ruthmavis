import { createFileRoute, Link } from '@tanstack/react-router';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect, useMemo } from 'react';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { getShippingRates } from '@/lib/shop.functions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export const initializePayment = createServerFn({ method: 'POST' })
  .validator((data: { email: string; amount: number; metadata: any }) => 
    z.object({
      email: z.string().email(),
      amount: z.number(),
      metadata: z.any()
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const PAYSTACK_SECRET = process.env['PAYSTACK_SECRET_KEY'];
    if (!PAYSTACK_SECRET) throw new Error('Paystack secret not configured');

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        amount: Math.round(data.amount * 100), // convert to kobo
        metadata: data.metadata,
        callback_url: `${process.env['VITE_SITE_URL'] || 'http://localhost:8080'}/payment-verify`,
      }),
    });

    const result = await response.json();
    if (!result.status) throw new Error(result.message || 'Payment initialization failed');
    
    return result.data;
  });

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const cartTotalPrice = totalPrice();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    region: ''
  });

  const { data: shippingRates } = useQuery({
    queryKey: ['shipping-rates'],
    queryFn: () => getShippingRates()
  });

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata as any;
      if (metadata?.shipping_address) {
        setShipping(s => ({
          ...s,
          ...metadata.shipping_address,
          email: user.email || ''
        }));
      } else if (user.email) {
        setShipping(s => ({ ...s, email: user.email || '' }));
      }
    }
  }, [user]);

  const selectedRate = useMemo(() => {
    if (!shipping.region || !shippingRates) return null;
    return shippingRates.find(r => r.region === shipping.region);
  }, [shipping.region, shippingRates]);

  const shippingAmount = useMemo(() => {
    if (!selectedRate) return 0;
    if (selectedRate.free_shipping_threshold && cartTotalPrice >= Number(selectedRate.free_shipping_threshold)) {
      return 0;
    }
    return Number(selectedRate.price);
  }, [selectedRate, cartTotalPrice]);

  const taxRate = 0.15;
  const taxAmount = (cartTotalPrice + shippingAmount) * taxRate;
  const grandTotal = cartTotalPrice + shippingAmount + taxAmount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id ?? null,
          total_amount: grandTotal,
          status: 'pending',
          shipping_details: shipping as any,
          shipping_amount: shippingAmount,
          tax_amount: taxAmount
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      const paymentData = await initializePayment({
        data: {
          email: shipping.email,
          amount: grandTotal,
          metadata: {
            order_id: order.id,
            user_id: user?.id ?? null
          }
        }
      });

      window.location.href = paymentData.authorization_url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h2 className="text-2xl font-serif text-primary">Your bag is empty</h2>
        <Button asChild className="mt-6 bg-burgundy">
          <Link to="/shop">Go Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Order Summary Toggle */}
      <div className="lg:hidden border-b border-gray-200 bg-gray-50 px-4 py-4">
        <button className="flex w-full items-center justify-between text-burgundy" onClick={() => document.getElementById('mobile-summary')?.classList.toggle('hidden')}>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm">Show order summary</span>
          </div>
          <span className="font-bold">R {grandTotal.toFixed(2)}</span>
        </button>
        <div id="mobile-summary" className="hidden mt-4 space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.variantId}`} className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200 bg-white">
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 p-0 text-[10px] text-white">
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{item.name}</h4>
                {item.variantLabel && <p className="text-xs text-gray-500">{item.variantLabel}</p>}
              </div>
              <span className="text-sm font-medium">R {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>R {cartTotalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span>{shippingAmount === 0 ? 'Free' : `R ${shippingAmount.toFixed(2)}`}</span></div>
            <div className="flex justify-between text-sm"><span>VAT (15%)</span><span>R {taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 text-lg font-bold"><span>Total</span><span>R {grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid min-h-screen lg:grid-cols-[1fr_450px]">
        {/* Left Column: Form */}
        <div className="px-4 py-8 lg:px-12 lg:py-16">
          <div className="mb-8">
            <h1 className="text-2xl font-serif text-burgundy mb-4">Ruth Mavis Accessories</h1>
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link to="/shop" className="hover:text-burgundy">Cart</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-gray-900">Information</span>
              <ChevronRight className="h-3 w-3" />
              <span>Shipping</span>
              <ChevronRight className="h-3 w-3" />
              <span>Payment</span>
            </nav>
          </div>

          <form onSubmit={handleCheckout} className="space-y-8 max-w-xl">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Contact</h2>
                {!user && <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-burgundy underline">Log in</Link></p>}
              </div>
              <Input 
                placeholder="Email Address" 
                type="email"
                required
                value={shipping.email}
                onChange={e => setShipping(s => ({ ...s, email: e.target.value }))}
                className="h-12 border-gray-300 focus:ring-burgundy"
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-medium">Shipping address</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="First name" 
                  required
                  value={shipping.firstName}
                  onChange={e => setShipping(s => ({ ...s, firstName: e.target.value }))}
                  className="h-12 border-gray-300 focus:ring-burgundy"
                />
                <Input 
                  placeholder="Last name" 
                  required
                  value={shipping.lastName}
                  onChange={e => setShipping(s => ({ ...s, lastName: e.target.value }))}
                  className="h-12 border-gray-300 focus:ring-burgundy"
                />
              </div>

              <Input 
                placeholder="Address" 
                required
                value={shipping.address}
                onChange={e => setShipping(s => ({ ...s, address: e.target.value }))}
                className="h-12 border-gray-300 focus:ring-burgundy"
              />

              <Input 
                placeholder="Apartment, suite, etc. (optional)" 
                value={shipping.apartment}
                onChange={e => setShipping(s => ({ ...s, apartment: e.target.value }))}
                className="h-12 border-gray-300 focus:ring-burgundy"
              />

              <div className="grid grid-cols-3 gap-4">
                <Input 
                  placeholder="City" 
                  required
                  value={shipping.city}
                  onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                  className="h-12 border-gray-300 focus:ring-burgundy col-span-1"
                />
                <div className="col-span-1">
                  <Select 
                    value={shipping.region} 
                    onValueChange={(val) => setShipping(s => ({ ...s, region: val }))}
                    required
                  >
                    <SelectTrigger className="h-12 border-gray-300 focus:ring-burgundy">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingRates?.map((rate: any) => (
                        <SelectItem key={rate.id} value={rate.region}>
                          {rate.region}
                        </SelectItem>
                      ))}
                      {(!shippingRates || shippingRates.length === 0) && (
                        <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Input 
                  placeholder="Postal code" 
                  required
                  value={shipping.postalCode}
                  onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))}
                  className="h-12 border-gray-300 focus:ring-burgundy col-span-1"
                />
              </div>

              <Input 
                placeholder="Phone" 
                type="tel"
                required
                value={shipping.phone}
                onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))}
                className="h-12 border-gray-300 focus:ring-burgundy"
              />
            </section>

            <div className="flex items-center justify-between pt-4">
              <Link to="/shop" className="text-burgundy flex items-center gap-1 text-sm">
                <ChevronLeft className="h-4 w-4" />
                Return to cart
              </Link>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-burgundy px-8 py-6 text-base font-medium hover:bg-burgundy/90"
              >
                {loading ? 'Processing...' : 'Continue to payment'}
              </Button>
            </div>
          </form>
          
          <div className="mt-16 pt-8 border-t border-gray-200">
            <nav className="flex gap-4 text-[10px] text-gray-500 underline">
              <Link to="/contact">Refund policy</Link>
              <Link to="/contact">Shipping policy</Link>
              <Link to="/contact">Privacy policy</Link>
              <Link to="/contact">Terms of service</Link>
            </nav>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="hidden lg:block border-l border-gray-200 bg-gray-50 px-8 py-16">
          <div className="sticky top-16 space-y-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.variantId}`} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200 bg-white">
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 p-0 text-[10px] text-white">
                      {item.quantity}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    {item.variantLabel && <p className="text-xs text-gray-500">{item.variantLabel}</p>}
                  </div>
                  <span className="text-sm font-medium">R {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator className="bg-gray-200" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">R {cartTotalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">{shippingAmount === 0 ? 'Calculated at next step' : `R ${shippingAmount.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Estimated taxes (VAT 15%)</span>
                <span className="font-medium text-gray-900">R {taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="flex justify-between items-center text-gray-900">
              <span className="text-lg font-medium">Total</span>
              <div className="text-right">
                <span className="text-xs text-gray-500 mr-2">ZAR</span>
                <span className="text-2xl font-bold">R {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {selectedRate?.free_shipping_threshold && cartTotalPrice < Number(selectedRate.free_shipping_threshold) && (
              <p className="text-xs text-burgundy italic text-center">
                Add R {(Number(selectedRate.free_shipping_threshold) - cartTotalPrice).toFixed(2)} more for FREE shipping!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}