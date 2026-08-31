import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getAdminStats } from '@/lib/admin.functions';
import { Reveal } from '@/components/Reveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Package, DollarSign } from 'lucide-react';

export const Route = createFileRoute('/admin/')({
  component: AdminOverview,
});

function AdminOverview() {
  const fetchStats = useServerFn(getAdminStats);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetchStats(),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading dashboard stats...
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Sales',
      value: `R ${stats?.totalSales.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: 'Active Orders',
      value: stats?.activeOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-burgundy/10 text-burgundy',
    },
    {
      title: 'Conversion Rate',
      value: '2.4%',
      icon: TrendingUp,
      color: 'bg-gold/10 text-gold-dark',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 100}>
            <Card className="border-gold/10 shadow-[var(--shadow-soft)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>

                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {card.value}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500 font-medium">+12%</span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <Card className="border-gold/10">
          <CardHeader>
            <CardTitle className="text-primary font-serif">
              Recent Orders
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground italic text-center py-8">
              Order activity visualization coming soon.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gold/10">
          <CardHeader>
            <CardTitle className="text-primary font-serif">
              Inventory Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground italic text-center py-8">
              Inventory levels tracking coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}