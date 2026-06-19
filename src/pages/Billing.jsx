import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, Trash2, ShoppingCart, Search } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import BillCart from '@/components/billing/BillCart';
import OrderHistoryTable from '@/components/billing/OrderHistoryTable';

export default function Billing() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: saleOrders = [] } = useQuery({
    queryKey: ['sale-orders'],
    queryFn: () => base44.entities.SaleOrder.list('-date', 200),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data) => base44.entities.SaleOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
    },
  });

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
  const finalAmount = Math.max(0, totalAmount - (discount || 0));

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    createOrderMutation.mutate({
      customer_name: customerName || 'Walk-in Customer',
      customer_phone: customerPhone,
      date: today,
      items: cart,
      total_amount: totalAmount,
      discount: discount || 0,
      final_amount: finalAmount,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'credit' ? 'unpaid' : 'paid',
      delivery_status: 'pending',
    });
  };

  const packetLabel = {
    '500ml': '500ml', '1_liter': '1L', '2_liter': '2L',
    'small_packet': 'Small', 'medium_packet': 'Medium', 'large_packet': 'Large',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" />
          {t('billing')}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('new')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'new' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t('newBill')}
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t('orderHistory')}
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <OrderHistoryTable orders={saleOrders} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['sale-orders'] })} />
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <h2 className="font-semibold text-foreground mb-3">{t('selectProducts')}</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('search')}
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="pl-9 bg-muted/50 border-0 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map(product => {
                  const inCart = cart.find(i => i.product_id === product.id);
                  return (
                    <motion.button
                      key={product.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => addToCart(product)}
                      className={`relative p-3 rounded-xl border-2 text-left transition-all ${inCart ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/40 hover:bg-muted/50'
                        }`}
                    >
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-16 object-cover rounded-lg mb-2" />
                      ) : (
                        <div className="w-full h-16 bg-muted rounded-lg mb-2 flex items-center justify-center text-2xl">
                          {product.category === 'milk' ? '🥛' : product.category === 'curd' ? '🍶' : product.category === 'ghee' ? '🫙' : '🧀'}
                        </div>
                      )}
                      <p className="font-medium text-sm text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{packetLabel[product.packet_type] || product.packet_type}</p>
                      <p className="text-sm font-bold text-primary mt-1">₹{product.price}</p>
                      <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full ${categoryColors[product.category] || 'bg-muted'}`}>
                        {t(product.category)}
                      </span>
                      {inCart && (
                        <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                          {inCart.quantity}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">{t('noData')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Cart / Bill */}
          <div className="lg:col-span-2">
            <BillCart
              cart={cart}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              discount={discount}
              setDiscount={setDiscount}
              totalAmount={totalAmount}
              finalAmount={finalAmount}
              onUpdateItem={updateCartItem}
              onSubmit={handleSubmitOrder}
              loading={createOrderMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}