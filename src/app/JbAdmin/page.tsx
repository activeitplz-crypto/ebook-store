export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './login-form';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  LogOut,
  Clock
} from 'lucide-react';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { adminLogout } from './actions';
import { Badge } from '@/components/ui/badge';

export default async function JbAdminPage() {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get('jb_admin_session')?.value === 'authenticated';

  if (!isAuth) {
    return <LoginForm />;
  }

  const supabase = await createClient();
  
  // Fetch all orders to calculate stats
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-bold">Error loading sales data. Please check database connection.</p>
      </div>
    );
  }

  const approvedOrders = orders.filter(o => o.status === 'approved');
  
  // Stats Calculation
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = subDays(now, 7);
  const fifteenDaysAgo = subDays(now, 15);
  const thirtyDaysAgo = subDays(now, 30);

  const stats = {
    totalOrders: orders.length,
    totalEarnings: approvedOrders.reduce((sum, o) => sum + o.price, 0),
    todayEarnings: approvedOrders
      .filter(o => isAfter(new Date(o.created_at), todayStart))
      .reduce((sum, o) => sum + o.price, 0),
    sevenDaysEarnings: approvedOrders
      .filter(o => isAfter(new Date(o.created_at), sevenDaysAgo))
      .reduce((sum, o) => sum + o.price, 0),
    fifteenDaysEarnings: approvedOrders
      .filter(o => isAfter(new Date(o.created_at), fifteenDaysAgo))
      .reduce((sum, o) => sum + o.price, 0),
    thirtyDaysEarnings: approvedOrders
      .filter(o => isAfter(new Date(o.created_at), thirtyDaysAgo))
      .reduce((sum, o) => sum + o.price, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Sales Dashboard</h1>
            <p className="text-muted-foreground italic">Comprehensive overview of store performance and revenue.</p>
          </div>
          <form action={adminLogout}>
            <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/5">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={<ShoppingBag className="h-6 w-6" />} 
            description="Total count of all submitted orders"
            isCurrency={false}
          />
          <StatCard 
            title="Total Earning" 
            value={stats.totalEarnings} 
            icon={<TrendingUp className="h-6 w-6" />} 
            description="Lifetime revenue from approved orders"
            variant="primary"
          />
          <StatCard 
            title="Today's Earning" 
            value={stats.todayEarnings} 
            icon={<Clock className="h-6 w-6" />} 
            description="Approved sales since midnight"
          />
          <StatCard 
            title="Last 7 Days" 
            value={stats.sevenDaysEarnings} 
            icon={<Calendar className="h-6 w-6" />} 
            description="Approved revenue in last week"
          />
          <StatCard 
            title="Last 15 Days" 
            value={stats.fifteenDaysEarnings} 
            icon={<Calendar className="h-6 w-6" />} 
            description="Approved revenue in last 15 days"
          />
          <StatCard 
            title="Last 30 Days" 
            value={stats.thirtyDaysEarnings} 
            icon={<Calendar className="h-6 w-6" />} 
            description="Approved revenue in last month"
          />
        </div>

        {/* Recent Orders Table */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-xl font-bold font-headline">Recent Orders</CardTitle>
            <CardDescription>The most recent 50 transactions on your store.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Customer</TableHead>
                  <TableHead className="font-bold">Products</TableHead>
                  <TableHead className="font-bold">Price</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 50).map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{order.sender_name}</span>
                        <span className="text-[10px] text-muted-foreground">{order.sender_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={order.product_title}>
                      {order.product_title}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      Rs {order.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-[10px] uppercase tracking-wider">
                        {order.payment_method || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={order.status === 'approved' ? 'default' : order.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="capitalize text-[10px]"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {orders.length === 0 && (
              <div className="py-20 text-center text-muted-foreground italic">
                No orders found in the database.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  isCurrency = true,
  variant = 'default' 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  description: string;
  isCurrency?: boolean;
  variant?: 'default' | 'primary'
}) {
  return (
    <Card className={`border-none shadow-lg transition-transform hover:scale-[1.02] duration-300 ${variant === 'primary' ? 'bg-primary text-white' : 'bg-white'}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-sm font-bold uppercase tracking-widest ${variant === 'primary' ? 'text-white/80' : 'text-slate-500'}`}>
          {title}
        </CardTitle>
        <div className={`p-2 rounded-xl ${variant === 'primary' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-bold font-headline">
          {isCurrency ? `PKR ${value.toLocaleString()}` : value.toLocaleString()}
        </div>
        <p className={`text-[11px] italic leading-tight ${variant === 'primary' ? 'text-white/70' : 'text-slate-400'}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
