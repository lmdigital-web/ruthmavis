import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminLayout,
});

import { Link } from '@tanstack/react-router';
import { LayoutDashboard, ShoppingBag, Package, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-6rem)] bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gold/10 flex flex-col fixed inset-y-0 z-40 mt-20 md:mt-24">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-serif text-xl">
              RM
            </div>
            <span className="font-serif text-xl font-bold text-primary">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-primary/5 text-muted-foreground [&.active]:bg-primary [&.active]:text-white"
            activeProps={{ className: 'active' }}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          <Link
            to="/admin/products"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-primary/5 text-muted-foreground [&.active]:bg-primary [&.active]:text-white"
            activeProps={{ className: 'active' }}
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-primary/5 text-muted-foreground [&.active]:bg-primary [&.active]:text-white"
            activeProps={{ className: 'active' }}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gold/10">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-burgundy hover:bg-burgundy/5"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
