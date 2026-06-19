import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/lib/i18n.jsx';
import { format } from 'date-fns';

export default function PaymentFormDialog({ open, onOpenChange, customers, onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    customer_id: '', customer_name: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'),
    method: 'cash', note: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        customer_id: '', customer_name: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'),
        method: 'cash', note: '',
      });
    }
  }, [open]);

  const selectCustomer = (id) => {
    const c = customers.find(x => x.id === id);
    if (c) setForm(prev => ({ ...prev, customer_id: c.id, customer_name: c.name }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, amount: parseFloat(form.amount) || 0 });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('recordPayment')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>{t('customerName')} *</Label>
            <Select value={form.customer_id} onValueChange={selectCustomer}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={t('customerName')} /></SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {(c.pending_amount || 0) > 0 && `(₹${c.pending_amount} due)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('amount')} *</Label>
              <Input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" className="mt-1" />
            </div>
            <div>
              <Label>{t('date')}</Label>
              <Input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>{t('paymentMethod')}</Label>
            <Select value={form.method} onValueChange={v => setForm(p => ({ ...p, method: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t('cash')}</SelectItem>
                <SelectItem value="upi">{t('upi')}</SelectItem>
                <SelectItem value="bank_transfer">{t('bank_transfer')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('note')}</Label>
            <Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="mt-1" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !form.customer_id || !form.amount}>
              {t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}