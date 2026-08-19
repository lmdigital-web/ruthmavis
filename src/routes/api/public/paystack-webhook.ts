import { createFileRoute } from '@tanstack/react-router';
import { createHmac, timingSafeEqual } from 'crypto';

export const Route = createFileRoute('/api/public/paystack-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get('x-paystack-signature');
        const body = await request.text();

        // Verify signature
        const secret = process.env['PAYSTACK_SECRET_KEY'];
        if (!secret) return new Response('Config error', { status: 500 });

        const hash = createHmac('sha512', secret)
          .update(body)
          .digest('hex');

        if (!signature || !timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
          return new Response('Invalid signature', { status: 401 });
        }

        const payload = JSON.parse(body);

        if (payload.event === 'charge.success') {
          const { order_id } = payload.data.metadata;
          
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          
          // Update order status (limited to existing columns in DB)
          await supabaseAdmin
            .from('orders')
            .update({ 
              status: 'paid'
            })
            .eq('id', order_id);
        }

        return new Response('OK', { status: 200 });
      }
    }
  }
});
