import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountData, updateProfile } from '@/lib/account.functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useState } from 'react';
import { LogOut, Package, User, MapPin } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/account')({
  component: AccountComponent,
});

function AccountComponent() {
  const accountDataFn = useServerFn(getAccountData);
  const updateProfileFn = useServerFn(updateProfile);
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const { data } = useSuspenseQuery({
    queryKey: ['account'],
    queryFn: () => accountDataFn(),
  });

  const [fullName, setFullName] = useState(data.profile.full_name || '');
  const [address, setAddress] = useState(
    typeof data.profile.shipping_address === 'string' 
      ? data.profile.shipping_address 
      : JSON.stringify(data.profile.shipping_address || {}, null, 2)
  );

  const mutation = useMutation({
    mutationFn: (variables: { full_name: string; shipping_address: any }) => updateProfileFn({ data: variables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error(error);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    let parsedAddress = address;
    try {
      parsedAddress = JSON.parse(address);
    } catch (e) {
      // Keep as string if not valid JSON
    }
    mutation.mutate({ full_name: fullName, shipping_address: parsedAddress });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/' });
    toast.success('Logged out successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container max-w-5xl py-12 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gold/20 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-primary">My Account</h1>
          <p className="text-muted-foreground">Manage your profile and track your orders</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2 border-burgundy/20 text-burgundy hover:bg-burgundy/5">
          <LogOut size={16} /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-gold/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User size={20} className="text-gold" /> Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="focus-visible:ring-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={data.profile.email} disabled className="bg-muted cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <textarea 
                    id="address" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your delivery address"
                  />
                </div>
                <Button type="submit" disabled={mutation.isPending} className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-medium">
                  {mutation.isPending ? 'Saving...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gold/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package size={20} className="text-gold" /> Order History
              </CardTitle>
              <CardDescription>Track your latest faith-filled gifts</CardDescription>
            </CardHeader>
            <CardContent>
              {data.orders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gold/10 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                  <Button variant="link" className="text-burgundy mt-2" onClick={() => navigate({ to: '/' })}>
                    Start shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gold/10 rounded-lg hover:bg-gold/5 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                          <Badge variant="secondary" className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-primary font-semibold">
                          R {Number(order.total_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
