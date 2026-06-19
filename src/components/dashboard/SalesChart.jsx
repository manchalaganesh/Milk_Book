import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/lib/i18n.jsx';
import { format, subDays } from 'date-fns';

export default function SalesChart({ orders }) {
  const { t } = useI18n();

  const chartData = useMemo(() => {
    const last14 = [];
    for (let i = 13; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayOrders = orders.filter(o => o.date === d);
      const liters = dayOrders.reduce((s, o) => s + (o.quantity || 0), 0);
      const sales = dayOrders.reduce((s, o) => s + (o.total_price || 0), 0);
      last14.push({ date: format(subDays(new Date(), i), 'MMM dd'), liters, sales });
    }
    return last14;
  }, [orders]);

  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
      <h3 className="font-semibold text-foreground mb-4">{t('salesOverview')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(213, 94%, 48%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(213, 94%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="litersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 60%, 46%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(152, 60%, 46%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
            <Tooltip
              contentStyle={{
                background: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 20%, 90%)',
                borderRadius: '12px',
                fontSize: '13px'
              }}
            />
            <Area type="monotone" dataKey="sales" stroke="hsl(213, 94%, 48%)" fill="url(#salesGrad)" strokeWidth={2} name="Sales (₹)" />
            <Area type="monotone" dataKey="liters" stroke="hsl(152, 60%, 46%)" fill="url(#litersGrad)" strokeWidth={2} name="Liters" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}