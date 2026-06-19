import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, IndianRupee, Phone, MapPin, Clock, Wallet, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerProfile() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });
  const customer = customers.find(c => c.id === id);

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => base44.entities.Payment.filter({ customer_id: id }, '-date', 100),
    enabled: !!id,
  });

  const recordPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    const paymentAmount = parseFloat(amount);
    await base44.entities.Payment.create({
      customer_id: id,
      customer_name: customer.name,
      amount: paymentAmount,
      date: format(new Date(), 'yyyy-MM-dd'),
      method,
      note,
    });
    const newPending = Math.max(0, (customer.pending_amount || 0) - paymentAmount);
    await base44.entities.Customer.update(id, { pending_amount: newPending });
    qc.invalidateQueries({ queryKey: ['payments', id] });
    qc.invalidateQueries({ queryKey: ['customers'] });
    setAmount('');
    setNote('');
    setSaving(false);
  };

  const methodLabels = {
    cash: t('cash'), upi: t('upi'), bank_transfer: t('bank_transfer'), other: t('other')
  };

  if (!customer) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">Customer not found</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
        </Button>
      </div>
    );
  }

  const pending = customer.pending_amount || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('customers')}
      </button>

      {/* Customer Info Card */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>
              {customer.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {customer.address}</span>}
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t(customer.delivery_slot)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={customer.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}>
              {t(customer.status)}
            </Badge>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`mt-5 p-4 rounded-xl flex items-center justify-between ${pending > 0 ? 'bg-destructive/5 border border-destructive/20' : 'bg-secondary/5 border border-secondary/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pending > 0 ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary'}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('pendingAmount')}</p>
              <p className={`text-xl font-bold ${pending > 0 ? 'text-destructive' : 'text-secondary'}`}>
                ₹{pending.toLocaleString()}
              </p>
            </div>
          </div>
          {pending > 0 && (
            <span className="text-xs text-destructive/70 font-medium">Payment due</span>
          )}
          {pending === 0 && (
            <span className="text-xs text-secondary/70 font-medium">All clear</span>
          )}
        </div>
      </div>

      {/* Record Payment */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary" /> {t('recordPayment')}
        </h2>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div>
            <Label className="text-xs">{t('amount')} (₹)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label className="text-xs">{t('paymentMethod')}</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t('cash')}</SelectItem>
                <SelectItem value="upi">{t('upi')}</SelectItem>
                <SelectItem value="bank_transfer">{t('bank_transfer')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t('note')}</Label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" className="mt-1 rounded-xl" />
          </div>
          <Button onClick={recordPayment} disabled={saving || !amount || parseFloat(amount) <= 0} className="rounded-xl">
            <IndianRupee className="w-4 h-4 mr-1" /> {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
        <h2 className="font-semibold text-foreground mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No payments recorded yet</p>
        ) : (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-foreground">₹{p.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{methodLabels[p.method]} {p.note && `• ${p.note}`}</p>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(p.date), 'dd MMM yyyy')}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-border font-semibold text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="text-foreground">₹{payments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}