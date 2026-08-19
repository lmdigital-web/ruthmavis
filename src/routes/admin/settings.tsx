import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getStoreSettings, updateStoreSettings } from '@/lib/admin-extended.functions';
import { Reveal } from '@/components/Reveal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, CreditCard, Mail, Percent, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettings,
});

function AdminSettings() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getStoreSettings);
  const updateSettingsFn = useServerFn(updateStoreSettings);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => fetchSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { key: string, value: any }) => updateSettingsFn({ data: variables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const [generalForm, setGeneralForm] = useState({
    store_name: '',
    contact_email: '',
    notification_email: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    currency: 'ZAR',
    tax_rate: 15,
    paystack_enabled: true
  });

  useEffect(() => {
    if (settings) {
      if (settings['general']) setGeneralForm(settings['general']);
      if (settings['payment']) setPaymentForm(settings['payment']);
    }
  }, [settings]);

  if (isLoading) return <div className="p-10 text-center italic text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Store Settings</h1>
        <p className="text-muted-foreground mt-2">Global configuration for Ruth Mavis boutique.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* General Settings */}
        <Reveal delay={100}>
          <Card className="border-gold/10 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Information
              </CardTitle>
              <CardDescription>Contact details and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input 
                  value={generalForm.store_name} 
                  onChange={e => setGeneralForm({...generalForm, store_name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Public Contact Email</Label>
                <Input 
                  type="email"
                  value={generalForm.contact_email} 
                  onChange={e => setGeneralForm({...generalForm, contact_email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Notification Email (Orders)</Label>
                <Input 
                  type="email"
                  value={generalForm.notification_email} 
                  onChange={e => setGeneralForm({...generalForm, notification_email: e.target.value})} 
                />
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white mt-2"
                onClick={() => updateMutation.mutate({ key: 'general', value: generalForm })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        {/* Payment & Tax */}
        <Reveal delay={200}>
          <Card className="border-gold/10 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payments & Tax
              </CardTitle>
              <CardDescription>Configure currency, VAT, and gateway status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Store Currency</Label>
                <Input 
                  value={paymentForm.currency} 
                  disabled
                  className="bg-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label>VAT / Tax Rate (%)</Label>
                <Input 
                  type="number"
                  value={paymentForm.tax_rate} 
                  onChange={e => setPaymentForm({...paymentForm, tax_rate: parseFloat(e.target.value)})} 
                />
              </div>
              <div className="flex items-center justify-between p-3 border border-gold/10 rounded-lg bg-secondary/10">
                <div className="space-y-0.5">
                  <Label className="text-primary font-medium">Paystack Integration</Label>
                  <p className="text-xs text-muted-foreground">Enable live checkout via Paystack</p>
                </div>
                <Switch 
                  checked={paymentForm.paystack_enabled}
                  onCheckedChange={checked => setPaymentForm({...paymentForm, paystack_enabled: checked})}
                />
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white mt-2"
                onClick={() => updateMutation.mutate({ key: 'payment', value: paymentForm })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        {/* Email Notification Preview (Placeholder) */}
        <Reveal delay={300} className="lg:col-span-2">
          <Card className="border-gold/10 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Notification System
              </CardTitle>
              <CardDescription>Automatic email triggers for order lifecycle.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Order Confirmation', status: 'Enabled', color: 'bg-green-500' },
                  { label: 'Payment Success', status: 'Enabled', color: 'bg-green-500' },
                  { label: 'Shipping Update', status: 'Manual', color: 'bg-gold' },
                ].map((item, i) => (
                  <div key={i} className="p-4 border border-gold/10 rounded-xl bg-white flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">Trigger: Status Change</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-6 text-center italic">
                Email templates are currently managed in code. GUI editor coming in future update.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
