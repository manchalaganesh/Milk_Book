import { useState } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderHistoryTable({ orders }) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = orders.filter(o =>
    !search || o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = {
    paid: 'bg-secondary/20 text-secondary',
    unpaid: 'bg-destructive/20 text-destructive',
    partial: 'bg-accent/20 text-accent-foreground',
  };

  const deliveryColor = {
    pending: 'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')} className="pl-9 bg-muted/50 border-0 rounded-xl" />
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">{t('noData')}</div>
        )}
        {filtered.map(order => (
          <div key={order.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-foreground text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${statusColor[order.payment_status]}`}>{order.payment_status}</Badge>
                <Badge className={`text-xs ${deliveryColor[order.delivery_status]}`}>{order.delivery_status}</Badge>
                <span className="font-bold text-primary text-sm">₹{order.final_amount}</span>
                {expanded === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
            {expanded === order.id && (
              <div className="border-t border-border p-4 bg-muted/20">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left pb-2">Product</th>
                      <th className="text-center pb-2">Qty</th>
                      <th className="text-right pb-2">Price</th>
                      <th className="text-right pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="py-1">{item.product_name}</td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">₹{item.price_per_unit}</td>
                        <td className="py-1 text-right font-medium">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-secondary mt-2 pt-2 border-t border-border/50">
                    <span>Discount</span><span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm mt-1">
                  <span>Final Amount</span><span className="text-primary">₹{order.final_amount}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}