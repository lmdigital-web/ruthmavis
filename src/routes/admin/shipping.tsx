import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getShippingRates } from '@/lib/shop.functions';
import { updateShippingRate, deleteShippingRate } from '@/lib/admin-extended.functions';
import { Reveal } from '@/components/Reveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Truck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/shipping')({
  component: AdminShipping,
});

function AdminShipping() {
  const queryClient = useQueryClient();
  const fetchRates = useServerFn(getShippingRates);
  const updateRateFn = useServerFn(updateShippingRate);
  const deleteRateFn = useServerFn(deleteShippingRate);

  const { data: rates, isLoading } = useQuery({
    queryKey: ['shipping-rates'],
    queryFn: () => fetchRates(),
  });

  const updateMutation = useMutation({
    mutationFn: (variables: any) => updateRateFn({ data: variables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      toast.success('Shipping rate saved');
      setNewRate({ region: '', price: 0, free_shipping_threshold: null });
      setIsAdding(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRateFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      toast.success('Shipping rate deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState({
    region: '',
    price: 0,
    free_shipping_threshold: null as number | null
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Shipping Management</h1>
          <p className="text-muted-foreground mt-2">Manage delivery costs and free shipping thresholds by region.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)} 
          className="bg-primary hover:bg-primary/90 text-white"
          disabled={isAdding}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Region
        </Button>
      </div>

      <Reveal delay={100}>
        <Card className="border-gold/10 shadow-[var(--shadow-soft)] overflow-hidden">
          <CardHeader className="bg-secondary/30">
            <CardTitle className="text-primary flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Regional Shipping Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gold/10">
                  <TableHead className="text-primary font-serif">Region / Province</TableHead>
                  <TableHead className="text-primary font-serif">Base Price (R)</TableHead>
                  <TableHead className="text-primary font-serif">Free Shipping Over (R)</TableHead>
                  <TableHead className="text-primary font-serif text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAdding && (
                  <TableRow className="bg-primary/5">
                    <TableCell>
                      <Input 
                        placeholder="e.g. Gauteng" 
                        className="h-9 border-gold/20"
                        value={newRate.region}
                        onChange={e => setNewRate({...newRate, region: e.target.value})}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        className="h-9 w-24 border-gold/20"
                        value={newRate.price}
                        onChange={e => setNewRate({...newRate, price: parseFloat(e.target.value)})}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        placeholder="None"
                        className="h-9 w-24 border-gold/20"
                        value={newRate.free_shipping_threshold || ''}
                        onChange={e => setNewRate({...newRate, free_shipping_threshold: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                      <Button 
                        size="sm" 
                        className="bg-burgundy text-white hover:bg-burgundy/90"
                        onClick={() => updateMutation.mutate(newRate)}
                        disabled={!newRate.region || updateMutation.isPending}
                      >
                        {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                      Loading shipping rates...
                    </TableCell>
                  </TableRow>
                ) : rates?.length === 0 && !isAdding ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                      No shipping rates defined.
                    </TableCell>
                  </TableRow>
                ) : (
                  rates?.map((rate) => (
                    <TableRow key={rate.id} className="hover:bg-primary/5 border-gold/5 transition-colors group">
                      <TableCell className="font-medium text-primary">{rate.region}</TableCell>
                      <TableCell>R {Number(rate.price).toFixed(2)}</TableCell>
                      <TableCell>{rate.free_shipping_threshold ? `R ${Number(rate.free_shipping_threshold).toFixed(2)}` : 'N/A'}</TableCell>
                      <TableCell className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Delete shipping rate for ${rate.region}?`)) {
                              deleteMutation.mutate(rate.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
