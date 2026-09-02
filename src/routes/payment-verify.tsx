import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { SectionHeading } from '@/components/SectionHeading';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

const verifySchema = z.object({
  reference: z.string().optional(),
});

export const Route = createFileRoute('/payment-verify')({
  validateSearch: (search) => verifySchema.parse(search),
  component: PaymentVerifyPage,
});

function PaymentVerifyPage() {
  const { reference } = useSearch({ from: '/payment-verify' });
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // This route is retained for compatibility with any existing
    // Paystack return URLs. Payment processing is now handled by
    // WooCommerce and its Paystack integration.
    //
    // Do not treat the presence of a reference as proof of payment.
    if (!reference) {
      setStatus('error');
      return;
    }

    // WooCommerce is now responsible for payment verification.
    // The React storefront should not independently mark an order
    // as paid without a server-side verification response.
    setStatus('success');
    clearCart();
  }, [reference, clearCart]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      {status === 'loading' && (
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          <p className="text-muted-foreground">
            Processing your payment...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500" />

          <SectionHeading
            title="Payment Processing"
            subtitle="Your payment has been returned from the payment provider. WooCommerce will handle the final order confirmation and payment status."
          />

          <Button
            onClick={() => navigate({ to: '/account' })}
            className="bg-burgundy"
          >
            View My Orders
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <XCircle className="mx-auto h-20 w-20 text-burgundy" />

          <SectionHeading
            title="Payment Status Unavailable"
            subtitle="We could not determine the payment status. Please check your WooCommerce order or contact support before making another payment."
          />

          <Button
            onClick={() => navigate({ to: '/checkout' })}
            variant="outline"
            className="border-gold/30"
          >
            Return to Checkout
          </Button>
        </div>
      )}
    </div>
  );
}