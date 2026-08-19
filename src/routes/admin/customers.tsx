import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getCustomers } from '@/lib/admin-extended.functions';
import { Reveal } from '@/components/Reveal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export const Route = createFileRoute('/admin/customers')({
  component: AdminCustomers,
});

function AdminCustomers() {
  const fetchCustomers = useServerFn(getCustomers);
  
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => fetchCustomers(),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Customer Management</h1>
        <p className="text-muted-foreground mt-2">View and manage your registered boutique customers.</p>
      </div>

      <Reveal delay={100}>
        <Card className="border-gold/10 shadow-[var(--shadow-soft)] overflow-hidden">
          <CardHeader className="bg-secondary/30">
            <CardTitle className="text-primary flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-gold/10">
                    <TableHead className="text-primary font-serif">Customer</TableHead>
                    <TableHead className="text-primary font-serif">Contact</TableHead>
                    <TableHead className="text-primary font-serif">Joined</TableHead>
                    <TableHead className="text-primary font-serif">Address</TableHead>
                    <TableHead className="text-primary font-serif text-right">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                        Loading customer data...
                      </TableCell>
                    </TableRow>
                  ) : customers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                        No customers registered yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers?.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-primary/5 border-gold/5 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-primary">{customer.full_name || 'Unnamed'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" /> {customer.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(customer.created_at), 'PPP')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {customer.shipping_address && typeof customer.shipping_address === 'object' 
                              ? (customer.shipping_address as any).city || 'Set' 
                              : 'Not set'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                            customer.role === 'admin' ? 'bg-burgundy/10 text-burgundy' : 'bg-gold/10 text-gold-dark'
                          }`}>
                            {customer.role || 'customer'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
