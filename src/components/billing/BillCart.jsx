import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';

const packetLabel = {
  '500ml': '500ml', '1_liter': '1L', '2_liter': '2L',
  'small_packet': 'S', 'medium_packet': 'M', 'large_packet': 'L',
  'kg': 'Kg', 'loose': 'Loose'
};

export default function BillCart({
  cart, customerName, setCustomerName, customerPhone, setCustomerPhone,
  paymentMethod, setPaymentMethod,
  discount, setDiscount, totalAmount, finalAmount,
  onUpdateItem, onSubmit, loading
}) {
  const { t } = useI18n();

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-4 space-y-4 sticky top-20">
      <h2 className="font-semibold text-foreground flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 text-primary" />
        {t('billSummary')} {cart.length > 0 && <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{cart.length}</span>}
      </h2>

      {/* Customer (optional) */}
      <div className="space-y-2">
        <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t('customerName') + ' (optional)'} className="rounded-xl" />
        <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder={t('phoneNumber') + ' (optional)'} className="rounded-xl" />
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
          {t('selectProducts')}
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {cart.map(item => (
            <div key={item.product_id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">{packetLabel[item.packet_type]} • ₹{item.price_per_unit}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => onUpdateItem(item.product_id, item.quantity - 1)} className="w-6 h-6 rounded-lg bg-background border flex items-center justify-center hover:bg-muted">
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 0;
                    if (val >= 0) onUpdateItem(item.product_id, val);
                  }}
                  className="w-12 h-7 text-center text-xs font-bold rounded-lg bg-transparent border border-input"
                />
                <button onClick={() => onUpdateItem(item.product_id, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-background border flex items-center justify-center hover:bg-muted">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs font-bold text-primary w-14 text-right">₹{item.total}</span>
            </div>
          ))}
        </div>
      )}

      {/* Options */}
      <div>
        <Label className="text-xs">{t('paymentMethod')}</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="mt-1 h-8 text-xs rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">{t('cash')}</SelectItem>
            <SelectItem value="upi">{t('upi')}</SelectItem>
            <SelectItem value="bank_transfer">{t('bank_transfer')}</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Discount */}
      <div>
        <Label className="text-xs">{t('discount')} (₹)</Label>
        <Input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="mt-1 h-8 text-xs rounded-xl" />
      </div>

      {/* Totals */}
      <div className="space-y-1 border-t border-border pt-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('subtotal')}</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-secondary">
            <span>{t('discount')}</span>
            <span>-₹{discount}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-foreground">
          <span>{t('total')}</span>
          <span className="text-primary">₹{finalAmount.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading || cart.length === 0}
        className="w-full rounded-xl gap-2"
      >
        <CheckCircle className="w-4 h-4" />
        {loading ? t('saving') : t('createBill')}
      </Button>
    </div>
  );
}