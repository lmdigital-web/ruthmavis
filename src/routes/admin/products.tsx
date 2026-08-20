import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { useServerFn } from '@tanstack/react-start';
import { getAdminProducts, updateAdminProduct, createAdminProduct, deleteAdminProduct } from '@/lib/admin.functions';
import { getCategories } from '@/lib/shop.functions';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit2, Package, Trash2, X, Loader2, ImagePlus } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/RichTextEditor';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { getProductAdditionalImages } from '@/lib/admin.functions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute('/admin/products')({
  component: AdminProducts,
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  
  const fetchProducts = useServerFn(getAdminProducts);
  const fetchCategories = useServerFn(getCategories);
  const updateProductFn = useServerFn(updateAdminProduct);
  const createProductFn = useServerFn(createAdminProduct);
  const deleteProductFn = useServerFn(deleteAdminProduct);
  const fetchAdditionalImages = useServerFn(getProductAdditionalImages);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchProducts(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (variables: any) => createProductFn({ data: variables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully');
      setIsDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (variables: any) => updateProductFn({ data: variables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated successfully');
      setIsDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductFn({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filteredProducts = useMemo(() => 
    products?.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: description,
      price: parseFloat(formData.get('price') as string),
      stock_quantity: parseInt(formData.get('stock_quantity') as string),
      category_id: formData.get('category_id') as string || null,
      image_url: additionalImages[0] || null,
      is_active: formData.get('is_active') === 'on',
      additional_images: additionalImages,
    };

    if (editingProduct) {
      updateMutation.mutate({ ...data, id: editingProduct.id });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your boutique inventory.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            setDescription('');
            setAdditionalImages([]);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-primary">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" defaultValue={editingProduct?.name} required placeholder="e.g. Floral Bible Cover" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" defaultValue={editingProduct?.slug} required placeholder="e.g. floral-bible-cover" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <RichTextEditor 
                    content={description} 
                    onChange={setDescription} 
                    placeholder="Describe the product details, features, and specs..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (R)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={editingProduct?.stock_quantity} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select name="category_id" defaultValue={editingProduct?.category_id || "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Uncategorized</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <Label>Product Images</Label>
                  <MultiImageUpload 
                    images={additionalImages} 
                    onChange={setAdditionalImages} 
                    productId={editingProduct?.id}
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Switch id="is_active" name="is_active" defaultChecked={editingProduct ? editingProduct.is_active : true} />
                  <Label htmlFor="is_active">Product Active / Visible</Label>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 mt-6 border-t pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  type="submit" 
                  className="bg-burgundy hover:bg-burgundy/90 text-white min-w-[140px] shadow-md" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Save Product
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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

      <div className="bg-white rounded-2xl border border-gold/10 shadow-[var(--shadow-soft)] relative z-0">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left table-auto">
            <thead className="bg-secondary/30 text-primary font-serif text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {isLoadingProducts ? (
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
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]" 
                             dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(product.description || '') : (product.description || '') }} 
                          />
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
                        checked={product.is_active ?? false}
                        onCheckedChange={(checked) => {
                          updateMutation.mutate({ id: product.id, is_active: checked });
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-blush/20 text-burgundy hover:bg-blush/40 gap-1.5 px-3 border border-burgundy/10"
                          onClick={async () => {
                            setEditingProduct(product);
                            setDescription(product.description || '');
                            
                            // Load additional images
                            try {
                              const imgs = await fetchAdditionalImages({ data: product.id });
                              setAdditionalImages(imgs.map(i => i.url));
                            } catch (e) {
                              // Fallback to main image if additional fetch fails
                              setAdditionalImages(product.image_url ? [product.image_url] : []);
                            }
                            
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this product?')) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
