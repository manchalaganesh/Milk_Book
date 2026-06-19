import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n.jsx';
import { format } from 'date-fns';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function OrderFormDialog({ open, onOpenChange, order, customers, products = [], onSave }) {
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_id: '', customer_name: '', customer_phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    delivery_slot: '',
  });
  const [items, setItems] = useState([]);

  const activeCustomers = customers.filter(c => c.status === 'active');
  const activeProducts = products.filter(p => p.status === 'active');

  useEffect(() => {
    if (order) {
      setForm({
        customer_id: order.customer_id || '',
        customer_name: order.customer_name || '',
        customer_phone: order.customer_phone || '',
        date: order.date || format(new Date(), 'yyyy-MM-dd'),
        delivery_slot: order.delivery_slot || '',
      });
      setItems((order.items || []).map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        packet_type: item.packet_type || '',
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        total: item.total,
      })));
    } else {
      setForm({
        customer_id: '', customer_name: '', customer_phone: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        delivery_slot: '',
      });
      setItems([]);
    }
  }, [order, open]);

  const selectCustomer = (id) => {
    const c = customers.find(x => x.id === id);
    if (c) {
      setForm(prev => ({
        ...prev,
        customer_id: c.id,
        customer_name: c.name,
        customer_phone: c.phone || '',
      }));
    }
  };

  const addProduct = () => {
    setItems(prev => [...prev, {
      product_id: '', product_name: '', packet_type: '',
      quantity: 1, price_per_unit: 0, total: 0,
    }]);
  };

  const removeProduct = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'product_id') {
        const prod = activeProducts.find(p => p.id === value);
        if (prod) {
          updated.product_name = prod.name;
          updated.packet_type = prod.packet_type;
          updated.price_per_unit = prod.price;
          updated.total = updated.quantity * prod.price;
        }
      }
      if (field === 'quantity') {
        updated.total = (parseFloat(value) || 0) * (updated.price_per_unit || 0);
      }
      return updated;
    }));
  };

  const totalAmount = items.reduce((s, i) => s + (i.total || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    await onSave({
      ...form,
      date: form.date,
      delivery_slot: form.delivery_slot || null,
      items: validItems,
      total_amount: totalAmount,
      final_amount: totalAmount,
      discount: 0,
      payment_status: 'unpaid',
      payment_method: 'cash',
      delivery_status: 'pending',
    }, order?.id);
    setSaving(false);
    onOpenChange(false);
  };

  const canSave = form.customer_id && form.date && items.some(i => i.product_id && i.quantity > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{order ? t('editOrder') : t('addOrder')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Customer */}
          {!order && (
            <div>
              <Label>{t('customerName')} *</Label>
              <Select value={form.customer_id} onValueChange={selectCustomer}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder={t('customerName')} /></SelectTrigger>
                <SelectContent>
                  {activeCustomers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('date')} *</Label>
              <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Delivery Time</Label>
              <Input
                type="time"
                value={form.delivery_slot}
                onChange={e => setForm(p => ({ ...p, delivery_slot: e.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="Optional"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">Optional — leave blank if not sure</p>
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Products *</Label>
              <Button type="button" size="sm" variant="outline" onClick={addProduct} className="rounded-xl gap-1 text-xs h-7">
                <Plus className="w-3 h-3" /> Add Product
              </Button>
            </div>

            {items.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-xl">
                Tap "Add Product" to add items to this order
              </p>
            )}

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-muted/30 rounded-xl p-3 space-y-2">
                  {/* Product select + Remove */}
                  <div className="flex items-center gap-2">
                    <Select value={item.product_id} onValueChange={v => updateItem(idx, 'product_id', v)}>
                      <SelectTrigger className="flex-1 h-9 text-sm rounded-lg"><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent>
                        {activeProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.price}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button type="button" onClick={() => removeProduct(idx)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                        className="w-9 h-9 rounded-lg bg-background border-2 border-border hover:border-primary/40 flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          if (val >= 1) updateItem(idx, 'quantity', val);
                        }}
                        className="w-14 h-9 text-center text-lg font-bold text-foreground bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateItem(idx, 'quantity', item.quantity + 1)}
                        className="w-9 h-9 rounded-lg bg-background border-2 border-border hover:border-primary/40 flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  {item.product_id && item.total > 0 && (
                    <div className="flex justify-between items-center pt-1 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Subtotal</span>
                      <span className="text-sm font-bold text-primary">₹{item.total}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="bg-primary/5 rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm font-medium">{t('total')}</span>
              <span className="text-xl font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Action */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
            <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={saving || !canSave}>
              {saving ? t('saving') : order ? t('save') : t('addOrder')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}