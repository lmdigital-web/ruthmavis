import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useServerFn } from '@tanstack/react-start';
import { SectionHeading } from '@/components/SectionHeading';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { verifyPaystackPayment } from './checkout';

const verifySchema = z.object({
  reference: z.string(),
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
  const verifyFn = useServerFn(verifyPaystackPayment);
 
  useEffect(() => {
    const verify = async () => {
      try {
        const data = await verifyFn({ data: reference });
        
        if (data.status && data.data.status === 'success') {
          setStatus('success');
          clearCart();
        } else {
          setStatus('error');
        }
      } catch (e) {
        setStatus('error');
      }
    };
    verify();
  }, [reference, clearCart]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      {status === 'loading' && (
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500" />
          <SectionHeading title="Payment Successful!" subtitle="Thank you for your order. We've received your payment and are starting to prepare your gifts." />
          <Button onClick={() => navigate({ to: '/account' })} className="bg-burgundy">
            View My Orders
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <XCircle className="mx-auto h-20 w-20 text-burgundy" />
          <SectionHeading title="Payment Failed" subtitle="Something went wrong with your transaction. Please try again or contact support." />
          <Button onClick={() => navigate({ to: '/checkout' })} variant="outline" className="border-gold/30">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
