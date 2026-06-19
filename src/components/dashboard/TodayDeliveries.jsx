import { useI18n } from '@/lib/i18n.jsx';
import { Badge } from '@/components/ui/badge';
import { Truck, IndianRupee } from 'lucide-react';

export default function TodayDeliveries({ orders, todayIncome }) {
  const { t } = useI18n();

  const delivered = orders.filter(o => o.delivery_status === 'delivered').length;
  const pending = orders.filter(o => o.delivery_status === 'pending').length;

  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border h-full">
      <h3 className="font-semibold text-foreground mb-4">{t('todayDeliveries')}</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">{t('delivered')}</span>
          </div>
          <Badge className="bg-secondary text-secondary-foreground">{delivered}</Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-accent/10 rounded-xl">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{t('pending')}</span>
          </div>
          <Badge className="bg-accent text-accent-foreground">{pending}</Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('dailyIncome')}</span>
          </div>
          <span className="font-bold text-foreground">₹{todayIncome.toLocaleString()}</span>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">{t('total')}: {orders.length} {t('orders').toLowerCase()}</p>
        </div>
      </div>
    </div>
  );
}