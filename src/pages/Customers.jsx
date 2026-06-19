import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataTable from '@/components/ui/DataTable';
import CustomerFormDialog from '@/components/customers/CustomerFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Customers() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.Customer.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const createOrderMut = useMutation({
    mutationFn: data => base44.entities.SaleOrder.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const deleteMut = useMutation({
    mutationFn: id => base44.entities.Customer.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const handleSave = async (customerData, orderData) => {
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, data: customerData });
    } else {
      const created = await base44.entities.Customer.create(customerData);
      if (orderData) {
        await base44.entities.SaleOrder.create({
          ...orderData,
          customer_id: created.id,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
        });
      }
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    }
  };

  const columns = [
    {
      key: 'name', label: t('customerName'), render: row => (
        <Link to={`/customers/${row.id}`} className="font-medium text-primary hover:underline">{row.name}</Link>
      )
    },
    { key: 'phone', label: t('phoneNumber') },
    { key: 'delivery_slot', label: t('deliverySlot'), render: row => <span className="text-muted-foreground">{t(row.delivery_slot)}</span> },
    {
      key: 'status', label: t('status'), render: row => (
        <Badge className={row.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}>
          {t(row.status)}
        </Badge>
      )
    },
    {
      key: 'pending_amount', label: t('pendingAmount'), render: row => (
        <span className={(row.pending_amount || 0) > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
          ₹{(row.pending_amount || 0).toLocaleString()}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('customers')}</h2>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> {t('addCustomer')}
        </Button>
      </div>

      <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
        <DataTable
          columns={columns}
          data={customers}
          searchKey="name"
          onEdit={row => { setEditing(row); setDialogOpen(true); }}
          onDelete={row => setDeleting(row)}
        />
      </div>

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editing}
        products={products}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{deleting?.name}</AlertDialogDescription>
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