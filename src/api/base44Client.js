import { supabase } from '../lib/supabaseClient';

const parseSort = (sortStr) => {
  if (!sortStr) return { column: 'created_at', ascending: false };
  const descending = sortStr.startsWith('-');
  let column = descending ? sortStr.substring(1) : sortStr;
  if (column === 'created_date' || column === 'created_at') {
    column = 'created_at';
  }
  return { column, ascending: !descending };
};

// Helper to get current user ID (Supabase ID or Local Guest fallback)
async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return user.id;
  }
  
  const loggedOut = localStorage.getItem('logged_out') === 'true';
  if (loggedOut) {
    return null;
  }
  
  return '00000000-0000-0000-0000-000000000000'; // fallback mock admin UUID
}

// Auto-seeding helpers (only run for local guest admin)
async function checkAndSeedCustomers(userId) {
  if (userId !== '00000000-0000-0000-0000-000000000000') return;
  try {
    if (!userId) return;
    const { count, error } = await supabase
      .from('customer')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    if (count !== null && count > 0) return;

    const defaultCustomers = [
      { name: 'Ramesh Kumar', phone: '9876543210', address: 'Flat 101, Green Meadows', milk_type: 'cow', quantity_per_day: 1, price_per_liter: 60, delivery_slot: 'morning', status: 'active', pending_amount: 120, user_id: userId },
      { name: 'Suresh Patel', phone: '9876543211', address: 'House 45, Royal Enclave', milk_type: 'buffalo', quantity_per_day: 2, price_per_liter: 70, delivery_slot: 'morning', status: 'active', pending_amount: 0, user_id: userId },
      { name: 'Priya Sharma', phone: '9876543212', address: 'Flat 304, Sky Towers', milk_type: 'cow', quantity_per_day: 1.5, price_per_liter: 60, delivery_slot: 'both', status: 'active', pending_amount: 90, user_id: userId }
    ];

    await supabase.from('customer').insert(defaultCustomers);
  } catch (e) {
    console.warn('Seeding customers failed:', e);
  }
}

async function checkAndSeedProducts(userId) {
  if (userId !== '00000000-0000-0000-0000-000000000000') return;
  try {
    if (!userId) return;
    const { count, error } = await supabase
      .from('product')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    if (count !== null && count > 0) return;

    const defaultProducts = [
      { name: 'Cow Milk', category: 'milk', packet_type: '1_liter', price: 60, stock: 100, low_stock_alert: 10, status: 'active', user_id: userId },
      { name: 'Buffalo Milk', category: 'milk', packet_type: '1_liter', price: 70, stock: 80, low_stock_alert: 10, status: 'active', user_id: userId },
      { name: 'Fresh Curd', category: 'curd', packet_type: '500ml', price: 40, stock: 50, low_stock_alert: 5, status: 'active', user_id: userId },
      { name: 'Organic Ghee', category: 'ghee', packet_type: 'kg', price: 650, stock: 20, low_stock_alert: 3, status: 'active', user_id: userId },
      { name: 'Table Butter', category: 'butter', packet_type: 'loose', price: 250, stock: 15, low_stock_alert: 3, status: 'active', user_id: userId },
      { name: 'Fresh Paneer', category: 'paneer', packet_type: 'kg', price: 350, stock: 30, low_stock_alert: 5, status: 'active', user_id: userId }
    ];

    await supabase.from('product').insert(defaultProducts);
  } catch (e) {
    console.warn('Seeding products failed:', e);
  }
}

async function checkAndSeedMilkOrders(userId) {
  if (userId !== '00000000-0000-0000-0000-000000000000') return;
  try {
    if (!userId) return;
    const { count, error: countError } = await supabase
      .from('milk_order')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (countError) throw countError;
    if (count !== null && count > 0) return;

    // Ensure we have customers first
    await checkAndSeedCustomers(userId);

    const { data: customers, error: custError } = await supabase
      .from('customer')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
      
    if (custError || !customers || customers.length === 0) return;

    const ordersToSeed = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      customers.forEach(customer => {
        const slots = customer.delivery_slot === 'both' ? ['morning', 'evening'] : [customer.delivery_slot || 'morning'];
        slots.forEach(slot => {
          const quantity = customer.quantity_per_day || 1;
          const price = customer.price_per_liter || 60;
          const total = quantity * price;
          
          const rand = Math.random();
          const delivery_status = rand > 0.1 ? 'delivered' : (rand > 0.03 ? 'skipped' : 'pending');

          ordersToSeed.push({
            customer_id: customer.id,
            customer_name: customer.name,
            date: dateStr,
            slot,
            milk_type: customer.milk_type || 'cow',
            quantity,
            price_per_liter: price,
            total_price: total,
            delivery_status,
            payment_status: delivery_status === 'delivered' ? 'paid' : 'unpaid',
            user_id: userId
          });
        });
      });
    }

    const chunkSize = 50;
    for (let i = 0; i < ordersToSeed.length; i += chunkSize) {
      const chunk = ordersToSeed.slice(i, i + chunkSize);
      await supabase.from('milk_order').insert(chunk);
    }
  } catch (e) {
    console.warn('Seeding milk orders failed:', e);
  }
}

const createEntityHandler = (tableName) => {
  return {
    list: async (sortStr, limit) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Unauthenticated');

      // Trigger check & seeds
      if (tableName === 'customer') await checkAndSeedCustomers(userId);
      if (tableName === 'product') await checkAndSeedProducts(userId);
      if (tableName === 'milk_order') await checkAndSeedMilkOrders(userId);

      const { column, ascending } = parseSort(sortStr);
      let query = supabase.from(tableName)
        .select('*')
        .eq('user_id', userId)
        .order(column, { ascending });
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    filter: async (criteria, sortStr, limit) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Unauthenticated');

      // Trigger check & seeds
      if (tableName === 'customer') await checkAndSeedCustomers(userId);
      if (tableName === 'product') await checkAndSeedProducts(userId);
      if (tableName === 'milk_order') await checkAndSeedMilkOrders(userId);

      const { column, ascending } = parseSort(sortStr);
      let query = supabase.from(tableName)
        .select('*')
        .eq('user_id', userId)
        .match(criteria)
        .order(column, { ascending });
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    get: async (id) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Unauthenticated');

      const { data, error } = await supabase.from(tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (data) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Unauthenticated');

      const { data: created, error } = await supabase.from(tableName)
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return created;
    },

    update: async (id, data) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Unauthenticated');

      const { data: updated, error } = await supabase.from(tableName)
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    delete: async (id) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Unauthenticated');

      const { error } = await supabase.from(tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return { success: true };
    }
  };
};

export const base44 = {
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.removeItem('logged_out');
        return {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        };
      }
      
      const loggedOut = localStorage.getItem('logged_out') === 'true';
      if (loggedOut) {
        return null;
      }

      return {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@example.com',
        full_name: 'Admin User',
      };
    },
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      localStorage.removeItem('logged_out');
      return data.user;
    },
    signUp: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      localStorage.removeItem('logged_out');
      return data.user;
    },
    logout: async () => {
      localStorage.setItem('logged_out', 'true');
      await supabase.auth.signOut();
      window.location.reload();
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      return true;
    },
    updatePassword: async (newPassword) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return true;
    },
    redirectToLogin: () => {
      console.log('Redirect to login called.');
    }
  },
  entities: {
    Customer: createEntityHandler('customer'),
    Product: createEntityHandler('product'),
    SaleOrder: createEntityHandler('sale_order'),
    Payment: createEntityHandler('payment'),
    MilkOrder: createEntityHandler('milk_order')
  }
};
