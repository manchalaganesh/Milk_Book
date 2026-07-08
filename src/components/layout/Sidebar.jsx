import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import {
  LayoutDashboard, Users, ClipboardList, CreditCard,
  BarChart3, X, Milk, LogOut, Globe, Package, Receipt
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'products', path: '/products', icon: Package },
  { key: 'billing', path: '/billing', icon: Receipt },
  { key: 'customers', path: '/customers', icon: Users },
  { key: 'orders', path: '/orders', icon: ClipboardList },
  { key: 'payments', path: '/payments', icon: CreditCard },
  { key: 'reports', path: '/reports', icon: BarChart3 },
];

export default function Sidebar({ open, onClose }) {
  const { t, lang, setLang } = useI18n();
  const location = useLocation();

  const handleLogout = () => {
    base44.auth.logout();
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <Link to="/" onClick={onClose} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Milk className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">MilkBook</h1>
            <p className="text-xs text-muted-foreground">{lang === 'te' ? 'పాల వ్యాపారం' : 'Dairy Manager'}</p>
          </div>
        </Link>
        <button onClick={onClose} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-muted">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <button
          onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-all"
        >
          <Globe className="w-5 h-5" />
          <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border z-30">
        {content}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-card z-50 lg:hidden shadow-2xl"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}