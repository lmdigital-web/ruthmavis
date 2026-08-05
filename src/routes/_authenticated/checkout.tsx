import { createFileRoute } from '@tanstack/react-router';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const initializePayment = createServerFn({ method: 'POST' })
  .input(z.object({
    email: z.string().email(),
    amount: z.number(),
    metadata: z.any()
  }))
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
        callback_url: `${process.env['VITE_SITE_URL'] || window.location.origin}/payment-verify`,
      }),
    });

    const result = await response.json();
    if (!result.status) throw new Error(result.message || 'Payment initialization failed');
    
    return result.data;
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
    postalCode: ''
  });

  useEffect(() => {
    if (user?.user_metadata?.shipping_address) {
      setShipping(user.user_metadata.shipping_address);
    }
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Order in Pending status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_amount: totalPrice,
          status: 'pending',
          shipping_details: shipping
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
          amount: totalPrice,
          metadata: {
            order_id: order.id,
            user_id: user?.id
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
    <div className="container mx-auto px-6 py-24">
      <SectionHeading title="Checkout" subtitle="Secure payment via Paystack" />
      
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <form onSubmit={handleCheckout} className="space-y-6 rounded-2xl border border-gold/10 bg-white/50 p-8 shadow-sm backdrop-blur-sm">
          <h3 className="text-xl font-serif text-primary">Shipping Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                required 
                value={shipping.address}
                onChange={e => setShipping(s => ({ ...s, address: e.target.value }))}
                className="border-gold/20 focus:border-gold"
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
                  className="border-gold/20 focus:border-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input 
                  id="postalCode" 
                  required 
                  value={shipping.postalCode}
                  onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))}
                  className="border-gold/20 focus:border-gold"
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-burgundy py-6 text-lg hover:bg-burgundy/90"
          >
            {loading ? 'Processing...' : `Pay R ${totalPrice.toFixed(2)}`}
          </Button>
        </form>

        <div className="space-y-6">
          <h3 className="text-xl font-serif text-primary">Order Summary</h3>
          <div className="rounded-2xl border border-gold/10 bg-cream/30 p-8">
            {items.map(item => (
              <div key={item.id} className="flex justify-between py-2 text-sm border-b border-gold/5 last:border-0">
                <span>{item.name} (x{item.quantity})</span>
                <span className="font-medium">R {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-6 flex justify-between border-t border-gold/10 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>R {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
