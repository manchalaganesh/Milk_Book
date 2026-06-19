import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const packetLabel = {
  '500ml': '500ml', '1_liter': '1L', '2_liter': '2L',
  'small_packet': 'S', 'medium_packet': 'M', 'large_packet': 'L',
  'kg': 'Kg', 'loose': 'Loose'
};

const categoryColors = {
  milk: 'bg-blue-100 text-blue-700',
  curd: 'bg-yellow-100 text-yellow-700',
  ghee: 'bg-orange-100 text-orange-700',
  butter: 'bg-amber-100 text-amber-700',
  paneer: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

const defaultForm = {
  name: '', phone: '', address: '',
  quantity_per_day: '', price_per_liter: '', delivery_slot: 'morning', status: 'active'
};

export default function CustomerFormDialog({ open, onOpenChange, customer, products = [], onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [cart, setCart] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [deliveryType, setDeliveryType] = useState('recurring'); // 'recurring' | 'one_time'
  const [deliveryDate, setDeliveryDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const isNew = !customer;

  useEffect(() => {
    if (customer) {
      setForm({
        ...defaultForm,
        ...customer,
        quantity_per_day: customer.quantity_per_day?.toString() || '',
        price_per_liter: customer.price_per_liter?.toString() || '',
      });
    } else {
      setForm(defaultForm);
    }
    setCart([]);
    setProductSearch('');
    setDeliveryType('recurring');
    setDeliveryDate(format(new Date(), 'yyyy-MM-dd'));
  }, [customer, open]);

  const activeProducts = products.filter(p => p.status === 'active' && p.stock > 0);
  const filteredProducts = activeProducts.filter(p =>
    !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i => i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price_per_unit }
          : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        packet_type: product.packet_type,
        quantity: 1,
        price_per_unit: product.price,
        total: product.price,
      }];
    });
  };

  const updateCartItem = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.product_id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product_id === productId
        ? { ...i, quantity, total: quantity * i.price_per_unit }
        : i
      ));
    }
  };

  const totalAmount = cart.reduce((s, i) => s + i.total, 0);

  const handleSave = async () => {
    setSaving(true);
    const customerData = {
      ...form,
      quantity_per_day: parseFloat(form.quantity_per_day) || 0,
      price_per_liter: parseFloat(form.price_per_liter) || 0,
    };

    const orderData = isNew && cart.length > 0 ? {
      items: cart,
      total_amount: totalAmount,
      final_amount: totalAmount,
      discount: 0,
      payment_status: 'unpaid',
      payment_method: 'cash',
      delivery_status: 'pending',
      delivery_slot: deliveryType === 'recurring' ? form.delivery_slot : 'morning',
      date: deliveryType === 'one_time' ? deliveryDate : format(new Date(), 'yyyy-MM-dd'),
      note: deliveryType === 'recurring' ? 'Recurring daily order' : null,
    } : null;

    await onSave(customerData, orderData);
    setSaving(false);
    onOpenChange(false);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-2">
          <DialogTitle>{customer ? t('editCustomer') : t('addCustomer')}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column — Customer Details */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('customerDetails')}</p>
            <div>
              <Label>{t('customerName')} *</Label>
              <Input value={form.name} onChange={e => update('name', e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>{t('phoneNumber')} *</Label>
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} className="mt-1 rounded-xl" type="tel" />
            </div>
            <div>
              <Label>{t('address')}</Label>
              <Input value={form.address} onChange={e => update('address', e.target.value)} className="mt-1 rounded-xl" />
            </div>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">{t('milkPreferences')}</p>
            <div>
              <Label>{t('deliverySlot')}</Label>
              <Select value={form.delivery_slot} onValueChange={v => update('delivery_slot', v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">{t('morning')}</SelectItem>
                  <SelectItem value="evening">{t('evening')}</SelectItem>
                  <SelectItem value="both">{t('both')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('quantityPerDay')} (L)</Label>
                <Input value={form.quantity_per_day} onChange={e => update('quantity_per_day', e.target.value)} className="mt-1 rounded-xl" type="number" step="0.5" />
              </div>
              <div>
                <Label>{t('pricePerLiter')} (₹)</Label>
                <Input value={form.price_per_liter} onChange={e => update('price_per_liter', e.target.value)} className="mt-1 rounded-xl" type="number" />
              </div>
            </div>

            {customer && (
              <div>
                <Label>{t('status')}</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Right Column — Order Details (new customers only) */}
          <div className="space-y-4">
            {isNew ? (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('newBill')}</p>

                {/* Delivery Type */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('recurring')}
                    className={`p-2 rounded-xl text-xs font-medium border-2 transition-all ${deliveryType === 'recurring' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                      }`}
                  >
                    🔁 {t('recurring')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('one_time')}
                    className={`p-2 rounded-xl text-xs font-medium border-2 transition-all ${deliveryType === 'one_time' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                      }`}
                  >
                    📅 One-Time
                  </button>
                </div>

                {deliveryType === 'one_time' && (
                  <div>
                    <Label>Delivery Date *</Label>
                    <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="mt-1 rounded-xl" />
                  </div>
                )}

                {deliveryType === 'recurring' && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-xl">
                    Daily {t(form.delivery_slot)} delivery starting today
                  </p>
                )}

                {/* Product Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('search') + ' ' + t('products')}
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="pl-9 bg-muted/50 border-0 rounded-xl"
                  />
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                  {filteredProducts.map(product => {
                    const inCart = cart.find(i => i.product_id === product.id);
                    return (
                      <motion.button
                        key={product.id}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(product)}
                        className={`relative p-2 rounded-xl border text-left transition-all text-xs ${inCart ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                          }`}
                      >
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-muted-foreground">{packetLabel[product.packet_type]}</p>
                        <p className="font-bold text-primary mt-0.5">₹{product.price}</p>
                        {inCart && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                            {inCart.quantity}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <p className="col-span-3 text-center py-4 text-xs text-muted-foreground">{t('noData')}</p>
                  )}
                </div>

                {/* Cart Items */}
                {cart.length > 0 && (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product_id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-xl text-xs">
                        <span className="flex-1 truncate font-medium">{item.product_name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => updateCartItem(item.product_id, item.quantity - 1)} className="w-5 h-5 rounded-md bg-background border flex items-center justify-center">
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              if (val >= 0) updateCartItem(item.product_id, val);
                            }}
                            className="w-10 h-6 text-center text-xs font-bold rounded-md bg-transparent border border-input"
                          />
                          <button type="button" onClick={() => updateCartItem(item.product_id, item.quantity + 1)} className="w-5 h-5 rounded-md bg-background border flex items-center justify-center">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <span className="font-bold text-primary w-12 text-right">₹{item.total}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-sm pt-2 border-t border-border">
                      <span>{t('total')}</span>
                      <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {cart.length === 0 && (
                  <p className="text-xs text-center py-3 text-muted-foreground bg-muted/30 rounded-xl">
                    {t('selectProducts')}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Order details only available when creating a new customer
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 mt-2 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button
            className="flex-1 rounded-xl"
            onClick={handleSave}
            disabled={saving || !form.name || !form.phone || (isNew && cart.length === 0) || (isNew && deliveryType === 'one_time' && !deliveryDate)}
          >
            {saving ? t('saving') : isNew ? t('customer') + ' & ' + t('newBill') : t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}