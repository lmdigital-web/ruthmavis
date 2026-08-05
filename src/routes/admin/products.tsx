import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getAdminProducts, updateAdminProduct } from '@/lib/admin.functions';
import { getCategories } from '@/lib/shop.functions';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Package } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/products')({
  component: AdminProducts,
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchProducts = useServerFn(getAdminProducts);
  const updateProductFn = useServerFn(updateAdminProduct);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchProducts(),
  });

  const updateMutation = useMutation({
    mutationFn: (variables: Parameters<typeof updateProductFn>[0]['data']) => updateProductFn({ data: variables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your boutique inventory.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products or categories..."
          className="pl-10 border-gold/10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gold/10 overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/30 text-primary font-serif text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    Loading inventory data...
                  </td>
                </tr>
              ) : filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts?.map((product) => (
                  <tr key={product.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary/50 overflow-hidden border border-gold/10">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-primary">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-gold/20 text-gold-dark font-normal">
                        {product.categories?.name || 'Uncategorized'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">
                      R {Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-20 h-8 border-gold/10"
                          defaultValue={product.stock_quantity}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (val !== product.stock_quantity) {
                              updateMutation.mutate({ id: product.id, stock_quantity: val });
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={(checked) => {
                          updateMutation.mutate({ id: product.id, is_active: checked });
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
