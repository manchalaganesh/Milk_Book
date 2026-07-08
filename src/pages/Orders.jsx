import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CalendarDays, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import OrderFormDialog from '@/components/orders/OrderFormDialog';
import { format, isToday, isTomorrow, isAfter, startOfDay } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const filterTabs = [
  { key: 'today', label: "Today's" },
  { key: 'tomorrow', label: "Tomorrow's" },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const statusColors = {
  pending: 'bg-accent/10 text-accent',
  delivered: 'bg-secondary/10 text-secondary',
  cancelled: 'bg-muted text-muted-foreground',
};

const unitLabels = { liter: 'L', kg: 'Kg', piece: 'pcs', packet: 'pkt' };

export default function Orders() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [activeFilter, setActiveFilter] = useState('today');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const { data: orders = [] } = useQuery({
    queryKey: ['sale-orders'],
    queryFn: () => base44.entities.SaleOrder.list('-date', 200),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.SaleOrder.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SaleOrder.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sale-orders'] }),
  });

  const deleteMut = useMutation({
    mutationFn: id => base44.entities.SaleOrder.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sale-orders'] }),
  });

  const handleSave = async (formData, existingId) => {
    if (existingId) {
      await updateMut.mutateAsync({ id: existingId, data: formData });
    } else {
      await createMut.mutateAsync(formData);
      // Update customer pending_amount
      if (formData.customer_id) {
        const customer = customers.find(c => c.id === formData.customer_id);
        if (customer) {
          await base44.entities.Customer.update(formData.customer_id, {
            pending_amount: (customer.pending_amount || 0) + formData.final_amount,
          });
        }
      }
    }
  };

  const today = startOfDay(new Date());
  const filteredOrders = orders.filter(o => {
    const orderDate = startOfDay(new Date(o.date));
    switch (activeFilter) {
      case 'today': return isToday(orderDate);
      case 'tomorrow': return isTomorrow(orderDate);
      case 'upcoming': return isAfter(orderDate, today) && !isToday(orderDate) && !isTomorrow(orderDate) && o.delivery_status !== 'delivered';
      case 'completed': return o.delivery_status === 'delivered';
      default: return true;
    }
  });

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('orders')}</h2>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> {t('addOrder')}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${activeFilter === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-card rounded-2xl p-10 text-center border border-border">
            <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">No orders found</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Order Header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">{order.customer_name}</span>
                      <Badge className={statusColors[order.delivery_status]}>{t(order.delivery_status)}</Badge>
                      {order.payment_status !== 'paid' && (
                        <Badge className="bg-destructive/10 text-destructive text-[10px]">{t(order.payment_status)}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {format(new Date(order.date), 'dd MMM yyyy')}
                      </span>
                      {order.delivery_slot && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {order.delivery_slot}
                        </span>
                      )}
                      <span className="font-semibold text-foreground">₹{order.final_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-xs h-7"
                      onClick={(e) => { e.stopPropagation(); setEditing(order); setDialogOpen(true); }}
                    >
                      Edit
                    </Button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded Products */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border">
                    <div className="pt-3 space-y-1.5">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.product_name}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {item.quantity} {item.packet_type || 'unit'}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">₹{item.total || 0}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-border text-sm font-semibold">
                        <span>{t('total')}</span>
                        <span className="text-primary">₹{order.final_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {order.delivery_status === 'pending' && (
                        <Button
                          size="sm"
                          className="rounded-xl text-xs h-7 bg-secondary hover:bg-secondary/90"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await base44.entities.SaleOrder.update(order.id, { delivery_status: 'delivered' });
                            qc.invalidateQueries({ queryKey: ['sale-orders'] });
                          }}
                        >
                          Mark Delivered
                        </Button>
                      )}
                      {order.payment_status !== 'paid' && (
                        <Button
                          size="sm"
                          className="rounded-xl text-xs h-7 bg-primary hover:bg-primary/90"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await base44.entities.SaleOrder.update(order.id, { payment_status: 'paid' });
                            if (order.customer_id) {
                              const customer = customers.find(c => c.id === order.customer_id);
                              if (customer) {
                                const newPending = Math.max(0, (customer.pending_amount || 0) - (order.final_amount || 0));
                                await base44.entities.Customer.update(order.customer_id, { pending_amount: newPending });
                              }
                            }
                            qc.invalidateQueries({ queryKey: ['sale-orders'] });
                            qc.invalidateQueries({ queryKey: ['customers'] });
                          }}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs h-7 text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); setDeleting(order); }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <OrderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={editing}
        customers={customers}
        products={products}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{deleting?.customer_name} — {deleting?.date}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteMut.mutate(deleting.id); setDeleting(null); }} className="bg-destructive">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}