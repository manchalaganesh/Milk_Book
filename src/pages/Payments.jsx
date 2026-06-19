import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertCircle } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import PaymentFormDialog from '@/components/payments/PaymentFormDialog';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Payments() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-date', 200),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.Payment.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: id => base44.entities.Payment.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleSave = async (formData) => {
    await createMut.mutateAsync(formData);
    // Update customer's pending amount
    const customer = customers.find(c => c.id === formData.customer_id);
    if (customer) {
      const newPending = Math.max(0, (customer.pending_amount || 0) - formData.amount);
      await base44.entities.Customer.update(customer.id, { pending_amount: newPending });
      qc.invalidateQueries({ queryKey: ['customers'] });
    }
  };

  const customersWithDues = customers.filter(c => (c.pending_amount || 0) > 0);

  const methodBadge = {
    cash: 'bg-secondary/10 text-secondary',
    upi: 'bg-primary/10 text-primary',
    bank_transfer: 'bg-accent/10 text-accent',
    other: 'bg-muted text-muted-foreground',
  };

  const columns = [
    { key: 'customer_name', label: t('customerName'), render: row => <span className="font-medium">{row.customer_name}</span> },
    { key: 'amount', label: t('amount'), render: row => <span className="font-semibold text-secondary">₹{row.amount.toLocaleString()}</span> },
    { key: 'date', label: t('date'), render: row => format(new Date(row.date), 'dd MMM yyyy') },
    {
      key: 'method', label: t('paymentMethod'), render: row => (
        <Badge className={methodBadge[row.method]}>{t(row.method)}</Badge>
      )
    },
    { key: 'note', label: t('note'), render: row => <span className="text-muted-foreground text-xs">{row.note || '—'}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('payments')}</h2>
        <Button onClick={() => setDialogOpen(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> {t('recordPayment')}
        </Button>
      </div>

      {/* Pending dues summary */}
      {customersWithDues.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-destructive">{t('pendingPayments')}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {customersWithDues.map(c => (
              <Badge key={c.id} variant="outline" className="border-destructive/30 text-destructive">
                {c.name}: ₹{(c.pending_amount || 0).toLocaleString()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
        <DataTable
          columns={columns}
          data={payments}
          searchKey="customer_name"
          onDelete={row => setDeleting(row)}
        />
      </div>

      <PaymentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customers={customers}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>₹{deleting?.amount} - {deleting?.customer_name}</AlertDialogDescription>
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