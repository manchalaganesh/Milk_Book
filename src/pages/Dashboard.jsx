import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n.jsx';
import StatCard from '@/components/ui/StatCard';
import { Users, Droplets, IndianRupee, AlertCircle, Plus, ClipboardList, CreditCard, Package, Receipt, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import SalesChart from '@/components/dashboard/SalesChart';
import TodayDeliveries from '@/components/dashboard/TodayDeliveries';

export default function Dashboard() {
  const { t } = useI18n();
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ['orders-all'],
    queryFn: () => base44.entities.MilkOrder.list('-date', 500),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-all'],
    queryFn: () => base44.entities.Payment.list('-date', 500),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: saleOrders = [] } = useQuery({
    queryKey: ['sale-orders'],
    queryFn: () => base44.entities.SaleOrder.list('-date', 200),
  });

  const activeCustomers = customers.filter(c => c.status === 'active');
  const todayOrders = allOrders.filter(o => o.date === today);
  const monthOrders = allOrders.filter(o => o.date >= monthStart);

  const totalLiters = monthOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalSales = monthOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const totalPending = customers.reduce((sum, c) => sum + (c.pending_amount || 0), 0);
  const todayIncome = todayOrders.filter(o => o.delivery_status === 'delivered').reduce((sum, o) => sum + (o.total_price || 0), 0);

  const lowStockProducts = products.filter(p => p.stock <= (p.low_stock_alert || 10) && p.status === 'active');
  const todaySaleOrders = saleOrders.filter(o => o.date === today);
  const todaySaleIncome = todaySaleOrders.reduce((s, o) => s + (o.final_amount || 0), 0);

  // Top products by sale count
  const productSales = {};
  saleOrders.forEach(order => (order.items || []).forEach(item => {
    productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity;
  }));
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const quickActions = [
    { label: t('newBill'), icon: Receipt, path: '/billing', color: 'bg-primary text-primary-foreground' },
    { label: t('addProduct'), icon: Package, path: '/products', color: 'bg-secondary text-secondary-foreground' },
    { label: t('addCustomer'), icon: Plus, path: '/customers', color: 'bg-accent text-accent-foreground' },
    { label: t('recordPayment'), icon: CreditCard, path: '/payments', color: 'bg-muted text-foreground' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title={t('todaySales')} value={`₹${(todayIncome + todaySaleIncome).toLocaleString()}`} icon={IndianRupee} color="green" subtitle={t('today')} />
        <StatCard title={t('totalCustomers')} value={activeCustomers.length} icon={Users} color="blue" />
        <StatCard title={t('totalSales')} value={`₹${totalSales.toLocaleString()}`} icon={TrendingUp} color="amber" subtitle={t('thisMonth')} />
        <StatCard title={t('pendingPayments')} value={`₹${totalPending.toLocaleString()}`} icon={AlertCircle} color="red" />
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{t('lowStockAlert')}:</span> {lowStockProducts.map(p => p.name).join(', ')}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t('quickActions')}</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(action => (
            <Link
              key={action.path}
              to={action.path}
              className={`${action.color} rounded-2xl p-4 flex flex-col items-center gap-2 text-center shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs sm:text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Charts and Today */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3">
          <SalesChart orders={allOrders} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <TodayDeliveries orders={todayOrders} todayIncome={todayIncome} />
          {topProducts.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> {t('topProducts')}
              </h3>
              <div className="space-y-2">
                {topProducts.map(([name, qty], i) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      <span className="text-sm text-foreground truncate max-w-[140px]">{name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{qty} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}