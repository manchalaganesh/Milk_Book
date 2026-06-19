import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';

export default function DataTable({ columns, data, searchKey, onEdit, onDelete, pageSize = 10 }) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = data.filter(row => {
    if (!search || !searchKey) return true;
    const val = row[searchKey];
    return val && val.toString().toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 bg-muted/50 border-0 rounded-xl"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">{t('actions')}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-12 text-muted-foreground">
                  {t('noData')}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-muted/30 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right space-x-1">
                      {onEdit && (
                        <Button size="sm" variant="ghost" onClick={() => onEdit(row)} className="text-primary hover:text-primary">
                          {t('edit')}
                        </Button>
                      )}
                      {onDelete && (
                        <Button size="sm" variant="ghost" onClick={() => onDelete(row)} className="text-destructive hover:text-destructive">
                          {t('delete')}
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} {t('total')}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span>{page + 1} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}