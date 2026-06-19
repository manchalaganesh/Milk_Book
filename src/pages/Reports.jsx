import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n.jsx';
import StatCard from '@/components/ui/StatCard';
import { IndianRupee, Droplets, Users, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const COLORS = ['hsl(213, 94%, 48%)', 'hsl(152, 60%, 46%)', 'hsl(38, 92%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(0, 72%, 56%)'];

export default function Reports() {
  const { t } = useI18n();
  const [period, setPeriod] = useState('3');

  const { data: orders = [] } = useQuery({
    queryKey: ['orders-all'],
    queryFn: () => base44.entities.MilkOrder.list('-date', 1000),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-all'],
    queryFn: () => base44.entities.Payment.list('-date', 1000),
  });

  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');
      const monthOrders = orders.filter(o => o.date >= start && o.date <= end);
      const monthPayments = payments.filter(p => p.date >= start && p.date <= end);
      months.push({
        month: format(date, 'MMM yyyy'),
        sales: monthOrders.reduce((s, o) => s + (o.total_price || 0), 0),
        liters: monthOrders.reduce((s, o) => s + (o.quantity || 0), 0),
        collected: monthPayments.reduce((s, p) => s + (p.amount || 0), 0),
      });
    }
    return months;
  }, [orders, payments, period]);

  const milkTypeData = useMemo(() => {
    const types = {};
    orders.forEach(o => {
      const type = o.milk_type || 'cow';
      types[type] = (types[type] || 0) + (o.quantity || 0);
    });
    return Object.entries(types).map(([name, value]) => ({ name: t(name), value: Math.round(value * 10) / 10 }));
  }, [orders, t]);

  const totalSales = orders.reduce((s, o) => s + (o.total_price || 0), 0);
  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalLiters = orders.reduce((s, o) => s + (o.quantity || 0), 0);

  const downloadCSV = () => {
    const headers = ['Month', 'Sales (₹)', 'Liters', 'Collected (₹)'];
    const rows = monthlyData.map(m => [m.month, m.sales, m.liters, m.collected]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milk-report-${format(new Date(), 'yyyy-MM')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('reports')}</h2>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadCSV} className="rounded-xl gap-2">
            <Download className="w-4 h-4" /> {t('downloadReport')}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title={t('totalSales')} value={`₹${totalSales.toLocaleString()}`} icon={IndianRupee} color="blue" />
        <StatCard title={t('totalLitersSold')} value={`${totalLiters.toFixed(0)}L`} icon={Droplets} color="green" />
        <StatCard title={t('totalCustomers')} value={customers.length} icon={Users} color="amber" />
        <StatCard title={`${t('payments')} Collected`} value={`₹${totalCollected.toLocaleString()}`} icon={TrendingUp} color="green" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-4">{t('monthlyIncome')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 20%, 90%)' }} />
                <Bar dataKey="sales" fill="hsl(213, 94%, 48%)" radius={[6, 6, 0, 0]} name="Sales (₹)" />
                <Bar dataKey="collected" fill="hsl(152, 60%, 46%)" radius={[6, 6, 0, 0]} name="Collected (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-4">{t('milkType')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={milkTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {milkTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}