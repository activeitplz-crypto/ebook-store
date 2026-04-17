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
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  LogOut, 
  Clock, 
  Truck, 
  ExternalLink, 
  ImageIcon 
} from 'lucide-react';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { adminLogout } from './actions';
import Image from 'next/image';
import Link from 'next/link';
import { OrderActions } from './order-actions';

export default async function JbAdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('jb_admin_session');
  const isAuth = session?.value === 'authenticated';

  if (!isAuth) {
    return <LoginForm />;
  }

  const supabase = await createClient();
  
  // Fetch all orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-bold">Error loading sales data: {error.message}</p>
      </div>
    );
  }

  const orderList = orders || [];

  // Stats Calculation - Exact matching for 'confirmed' status
  const confirmedOrders = orderList.filter(o => String(o.status).toLowerCase() === 'confirmed');
  
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = subDays(now, 7);
  const fifteenDaysAgo = subDays(now, 15);
  const thirtyDaysAgo = subDays(now, 30);

  const stats = {
    totalOrders: orderList.length,
    totalEarnings: confirmedOrders.reduce((sum, o) => sum + Number(o.price || 0), 0),
    todayEarnings: confirmedOrders
      .filter(o => isAfter(new Date(o.created_at), todayStart))
      .reduce((sum, o) => sum + Number(o.price || 0), 0),
    sevenDaysEarnings: confirmedOrders
      .filter(o => isAfter(new Date(o.created_at), sevenDaysAgo))
      .reduce((sum, o) => sum + Number(o.price || 0), 0),
    fifteenDaysEarnings: confirmedOrders
      .filter(o => isAfter(new Date(o.created_at), fifteenDaysAgo))
      .reduce((sum, o) => sum + Number(o.price || 0), 0),
    thirtyDaysEarnings: confirmedOrders
      .filter(o => isAfter(new Date(o.created_at), thirtyDaysAgo))
      .reduce((sum, o) => sum + Number(o.price || 0), 0),
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
            description="Lifetime revenue from confirmed orders"
            variant="primary"
          />
          <StatCard 
            title="Today's Earning" 
            value={stats.todayEarnings} 
            icon={<Clock className="h-6 w-6" />} 
            description="Confirmed sales since midnight"
          />
          <StatCard 
            title="Last 7 Days" 
            value={stats.sevenDaysEarnings} 
            icon={<Calendar className="h-6 w-6" />} 
            description="Confirmed revenue in last week"
          />
          <StatCard 
            title="Last 15 Days" 
            value={stats.fifteenDaysEarnings} 
            icon={<Calendar className="h-6 w-6" />} 
            description="Confirmed revenue in last 15 days"
          />
          <StatCard 
            title="Last 30 Days" 
            value={stats.thirtyDaysEarnings} 
            icon={<Calendar className="h-6 w-6" />} 
            description="Confirmed revenue in last month"
          />
        </div>

        {/* Recent Orders Table */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-xl font-bold font-headline">Manage Orders</CardTitle>
            <CardDescription>Track status and update payments. Earnings update instantly upon "Confirmed" status.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Delivery Contact</TableHead>
                    <TableHead className="font-bold">Products</TableHead>
                    <TableHead className="font-bold text-center">Price</TableHead>
                    <TableHead className="font-bold text-center">Receipt</TableHead>
                    <TableHead className="font-bold text-center">Date</TableHead>
                    <TableHead className="font-bold text-right">Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderList.slice(0, 100).map((order) => {
                    return (
                      <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{order.sender_name}</span>
                            <span className="text-[10px] text-muted-foreground">{order.sender_number}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 p-1.5 rounded-md w-fit">
                            <Truck className="h-3 w-3 text-primary" />
                            {order.delivery_contact}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-slate-800 leading-tight">
                            {order.product_title}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-primary text-center whitespace-nowrap">
                          Rs {Number(order.price || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {order.screenshot_url ? (
                              <Link 
                                href={order.screenshot_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group relative block h-10 w-10 overflow-hidden rounded border border-slate-200 hover:border-primary transition-colors"
                              >
                                <Image 
                                  src={order.screenshot_url} 
                                  alt="Payment Proof" 
                                  fill 
                                  className="object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <ExternalLink className="h-3 w-3 text-white" />
                                </div>
                              </Link>
                            ) : (
                              <div className="h-10 w-10 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground text-center">
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <OrderActions orderId={order.id} currentStatus={order.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {orderList.length === 0 && (
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
