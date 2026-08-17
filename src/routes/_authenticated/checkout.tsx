import { createFileRoute, Link } from '@tanstack/react-router';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect, useMemo } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { getShippingRates } from '@/lib/shop.functions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

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

export const verifyPaystackPayment = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: string) => z.string().parse(data))
  .handler(async ({ data: reference }) => {
    const PAYSTACK_SECRET = process.env['PAYSTACK_SECRET_KEY'];
    if (!PAYSTACK_SECRET) throw new Error('Paystack secret not configured');

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const result = await response.json();
    return result;
  });

export const Route = createFileRoute('/_authenticated/checkout')({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    postalCode: '',
    region: ''
  });

  const { data: shippingRates } = useQuery({
    queryKey: ['shipping-rates'],
    queryFn: () => getShippingRates()
  });

  useEffect(() => {
    const metadata = user?.user_metadata as any;
    if (metadata?.shipping_address) {
      setShipping(s => ({
        ...s,
        ...metadata.shipping_address
      }));
    }
  }, [user]);

  const selectedRate = useMemo(() => {
    if (!shipping.region || !shippingRates) return null;
    return shippingRates.find(r => r.region === shipping.region);
  }, [shipping.region, shippingRates]);

  const shippingAmount = useMemo(() => {
    if (!selectedRate) return 0;
    if (selectedRate.free_shipping_threshold && totalPrice >= Number(selectedRate.free_shipping_threshold)) {
      return 0;
    }
    return Number(selectedRate.price);
  }, [selectedRate, totalPrice]);

  // Placeholder for tax (e.g. 15% VAT in SA)
  const taxRate = 0.15;
  const taxAmount = (totalPrice + shippingAmount) * taxRate;
  const grandTotal = totalPrice + shippingAmount + taxAmount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Order in Pending status
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

      // 2. Create Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Initialize Paystack
      const paymentData = await initializePayment({
        data: {
          email: user?.email!,
          amount: grandTotal,
          metadata: {
            order_id: order.id,
            user_id: user?.id
          }
        }
      });

      // 4. Redirect to WooCommerce cart/checkout (headless handoff)
      // Since we are using WooCommerce as the backend now, we could also sync the cart to Woo
      // and redirect there for the final checkout experience.
      window.location.href = `https://shop.ruthmavisaccessories.co.za/cart/`;
      // Alternatively, we can continue with the current Paystack integration if preferred,
      // but usually headless setups hand off to the native checkout for compliance/security.
      
      // window.location.href = paymentData.authorization_url;
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
    <div className="container mx-auto px-6 py-24">
      <SectionHeading title="Checkout" subtitle="Secure payment via Paystack" />
      
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <form onSubmit={handleCheckout} className="space-y-6 rounded-2xl border border-gold/10 bg-white/50 p-8 shadow-sm backdrop-blur-sm">
          <h3 className="text-xl font-serif text-primary">Shipping Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region / Province</Label>
              <Select 
                value={shipping.region} 
                onValueChange={(val) => setShipping(s => ({ ...s, region: val }))}
                required
              >
                <SelectTrigger className="border-gold/20 focus:border-gold bg-white">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {shippingRates?.map((rate: any) => (
                    <SelectItem key={rate.id} value={rate.region}>
                      {rate.region}
                    </SelectItem>
                  ))}
                  {(!shippingRates || shippingRates.length === 0) && (
                    <SelectItem value="Mpumalanga">Mpumalanga (Default)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                required 
                value={shipping.address}
                onChange={e => setShipping(s => ({ ...s, address: e.target.value }))}
                className="border-gold/20 focus:border-gold bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  required 
                  value={shipping.city}
                  onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                  className="border-gold/20 focus:border-gold bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input 
                  id="postalCode" 
                  required 
                  value={shipping.postalCode}
                  onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))}
                  className="border-gold/20 focus:border-gold bg-white"
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-burgundy py-6 text-lg hover:bg-burgundy/90"
          >
            {loading ? 'Processing...' : `Pay R ${grandTotal.toFixed(2)}`}
          </Button>
        </form>

        <div className="space-y-6">
          <h3 className="text-xl font-serif text-primary">Order Summary</h3>
          <div className="rounded-2xl border border-gold/10 bg-cream/30 p-8 space-y-4">
            <div className="space-y-2">
              {items.map(item => (
                <div key={`${item.id}-${item.variantId}`} className="flex justify-between py-2 text-sm border-b border-gold/5 last:border-0">
                  <span>{item.name} (x{item.quantity})</span>
                  <span className="font-medium">R {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gold/10">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping {shipping.region ? `(${shipping.region})` : ''}</span>
                <span>{shippingAmount === 0 ? 'FREE' : `R ${shippingAmount.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT (15%)</span>
                <span>R {taxAmount.toFixed(2)}</span>
              </div>
              <div className="mt-6 flex justify-between pt-4 text-xl font-bold text-primary">
                <span>Total</span>
                <span>R {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {selectedRate?.free_shipping_threshold && totalPrice < Number(selectedRate.free_shipping_threshold) && (
              <p className="text-xs text-burgundy italic mt-2 text-center">
                Add R {(Number(selectedRate.free_shipping_threshold) - totalPrice).toFixed(2)} more for FREE shipping!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}