import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n.jsx';
import { base44 } from '@/api/base44Client';

const defaultForm = {
  name: '', category: 'milk', packet_type: '1_liter',
  price: '', stock: '', unit: 'liter', image_url: '',
  description: '', status: 'active', low_stock_alert: 10,
};

export default function ProductFormDialog({ open, product, onClose, onSave, loading }) {
  const { t } = useI18n();
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(product ? { ...defaultForm, ...product } : defaultForm);
  }, [product, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('image_url', file_url);
    setUploading(false);
  };

  const handleSave = () => {
    onSave({
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseFloat(form.stock) || 0,
      low_stock_alert: parseFloat(form.low_stock_alert) || 10,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? t('editProduct') : t('addProduct')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>{t('productName')}</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Cow Milk" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('category')}</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['milk', 'curd', 'ghee', 'butter', 'paneer', 'other'].map(c => (
                    <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('packetType')}</Label>
              <Select value={form.packet_type} onValueChange={v => set('packet_type', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    { v: '500ml', l: '500ml' }, { v: '1_liter', l: '1 Liter' },
                    { v: '2_liter', l: '2 Liter' }, { v: 'small_packet', l: 'Small Packet' },
                    { v: 'medium_packet', l: 'Medium Packet' }, { v: 'large_packet', l: 'Large Packet' },
                    { v: 'kg', l: 'Per Kg' }, { v: 'loose', l: 'Loose' },
                  ].map(({ v, l }) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('pricePerUnit')} (₹)</Label>
              <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{t('stock')}</Label>
              <Input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('unit')}</Label>
              <Select value={form.unit} onValueChange={v => set('unit', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['liter', 'kg', 'piece', 'packet'].map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('lowStockAlert')}</Label>
              <Input type="number" value={form.low_stock_alert} onChange={e => set('low_stock_alert', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>{t('status')}</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('description')}</Label>
            <Input value={form.description} onChange={e => set('description', e.target.value)} className="mt-1" placeholder="Optional description" />
          </div>
          <div>
            <Label>{t('productImage')}</Label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full text-sm text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-muted file:text-foreground cursor-pointer" />
            {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
            {form.image_url && !uploading && (
              <img src={form.image_url} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-xl border" />
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
            <Button onClick={handleSave} disabled={loading || uploading || !form.name || !form.price} className="flex-1">
              {loading ? '...' : t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}