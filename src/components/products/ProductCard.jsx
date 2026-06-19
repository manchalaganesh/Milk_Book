import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';

const packetLabel = {
  '500ml': '500ml', '1_liter': '1 Liter', '2_liter': '2 Liter',
  'small_packet': 'Small', 'medium_packet': 'Medium', 'large_packet': 'Large',
  'kg': 'Per Kg', 'loose': 'Loose'
};

const categoryEmoji = {
  milk: '🥛', curd: '🍶', ghee: '🫙', butter: '🧈', paneer: '🧀', other: '📦'
};

export default function ProductCard({ product, onEdit, onDelete }) {
  const { t } = useI18n();
  const isLowStock = product.stock <= (product.low_stock_alert || 10);

  return (
    <div className={`bg-card rounded-2xl border shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-all ${product.status === 'inactive' ? 'opacity-60' : ''}`}>
      {/* Image or Emoji */}
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-full h-28 object-cover rounded-xl" />
      ) : (
        <div className="w-full h-28 bg-muted rounded-xl flex items-center justify-center text-4xl">
          {categoryEmoji[product.category] || '📦'}
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-semibold text-foreground text-sm leading-tight">{product.name}</h3>
          {product.status === 'inactive' && (
            <Badge variant="outline" className="text-xs shrink-0">Off</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{packetLabel[product.packet_type] || product.packet_type}</p>
        <p className="text-lg font-bold text-primary mt-1">₹{product.price}</p>

        {/* Stock */}
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isLowStock ? 'text-amber-600' : 'text-secondary'}`}>
          {isLowStock && <AlertTriangle className="w-3 h-3" />}
          <span>{t('stock')}: {product.stock} {product.unit}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(product)} className="flex-1 rounded-xl h-8 text-xs">
          <Pencil className="w-3 h-3 mr-1" /> {t('edit')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(product)} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-xl">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}