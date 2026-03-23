import { supabase } from './supabaseClient.js';

// --- Helpers: camelCase <-> snake_case ---

function toSnakeCase(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

// --- TRANSACTIONS ---

export async function dbLoadTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
  return data.map((row) => {
    const item = toCamelCase(row);
    // Ensure amount is a number
    item.amount = Number(item.amount);
    // Map DB fields to app fields
    item.createdAt = item.createdAt || item.created_at;
    item.paymentMethod = item.paymentMethod || null;
    item.creditCardName = item.creditCardName || null;
    item.groupId = item.groupId || undefined;
    item.sourceOf = item.sourceOf || undefined;
    item.paid = Boolean(item.paid);
    // Remove DB-only fields
    delete item.userId;
    delete item.insertedAt;
    return item;
  });
}

export async function dbAddTransactions(transactions) {
  const userId = await getUserId();
  if (!userId) return false;
  const rows = transactions.map((t) => {
    const row = toSnakeCase(t);
    row.user_id = userId;
    // Remove fields that don't exist in the DB schema
    delete row.is_projection;
    delete row.account_type;
    delete row.external_id;
    delete row.bank_name;
    delete row.source;
    return row;
  });
  const { error } = await supabase.from('transactions').insert(rows);
  if (error) {
    console.error('Error adding transactions:', error);
    return false;
  }
  return true;
}

export async function dbUpdateTransaction(id, updates) {
  const row = toSnakeCase(updates);
  delete row.user_id;
  delete row.id;
  delete row.is_projection;
  const { error } = await supabase
    .from('transactions')
    .update(row)
    .eq('id', id);
  if (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
  return true;
}

export async function dbDeleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
  return true;
}

export async function dbDeleteTransactionsByGroup(groupId) {
  const { error } = await supabase.from('transactions').delete().eq('group_id', groupId);
  if (error) {
    console.error('Error deleting group:', error);
    return false;
  }
  return true;
}

export async function dbClearAllTransactions() {
  const userId = await getUserId();
  if (!userId) return false;
  const { error } = await supabase.from('transactions').delete().eq('user_id', userId);
  if (error) {
    console.error('Error clearing transactions:', error);
    return false;
  }
  return true;
}

// --- GOALS ---

export async function dbLoadGoals() {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .maybeSingle();
  if (error) {
    console.error('Error loading goals:', error);
    return { incomeGoal: '', expenseGoal: '' };
  }
  if (!data) return { incomeGoal: '', expenseGoal: '' };
  return {
    incomeGoal: data.income_goal !== null ? String(data.income_goal) : '',
    expenseGoal: data.expense_goal !== null ? String(data.expense_goal) : '',
  };
}

export async function dbSaveGoals(goals) {
  const userId = await getUserId();
  if (!userId) return false;
  const { error } = await supabase
    .from('goals')
    .upsert({
      user_id: userId,
      income_goal: goals.incomeGoal === '' ? null : Number(goals.incomeGoal),
      expense_goal: goals.expenseGoal === '' ? null : Number(goals.expenseGoal),
      updated_at: new Date().toISOString(),
    });
  if (error) {
    console.error('Error saving goals:', error);
    return false;
  }
  return true;
}

// --- ENVELOPES ---

export async function dbLoadEnvelopes() {
  const { data, error } = await supabase
    .from('envelopes')
    .select('*');
  if (error) {
    console.error('Error loading envelopes:', error);
    return [];
  }
  return data.map((row) => {
    const item = toCamelCase(row);
    item.monthlyLimit = Number(item.monthlyLimit);
    delete item.userId;
    return item;
  });
}

export async function dbSaveEnvelopes(envelopes) {
  const userId = await getUserId();
  if (!userId) return false;
  // Delete existing and re-insert
  await supabase.from('envelopes').delete().eq('user_id', userId);
  if (envelopes.length === 0) return true;
  const rows = envelopes.map((e) => ({
    ...toSnakeCase(e),
    user_id: userId,
  }));
  const { error } = await supabase.from('envelopes').insert(rows);
  if (error) {
    console.error('Error saving envelopes:', error);
    return false;
  }
  return true;
}

// --- CREDIT CARDS ---

export async function dbLoadCards() {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*');
  if (error) {
    console.error('Error loading cards:', error);
    return [];
  }
  return data.map((row) => {
    const item = toCamelCase(row);
    item.limitTotal = Number(item.limitTotal);
    delete item.userId;
    return item;
  });
}

export async function dbSaveCards(cards) {
  const userId = await getUserId();
  if (!userId) return false;
  await supabase.from('credit_cards').delete().eq('user_id', userId);
  if (cards.length === 0) return true;
  const rows = cards.map((c) => {
    const row = { ...toSnakeCase(c), user_id: userId };
    // Remove fields that don't exist in the DB schema
    delete row.brand;
    delete row.current_invoice;
    delete row.limit_available;
    return row;
  });
  const { error } = await supabase.from('credit_cards').insert(rows);
  if (error) {
    console.error('Error saving cards:', error);
    return false;
  }
  return true;
}

// --- USER PREFERENCES ---

export async function dbLoadUserPreferences() {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .maybeSingle();
  if (error) {
    console.error('Error loading preferences:', error);
    return null;
  }
  if (!data) return null;
  const notifPrefs = data.notification_prefs || {};
  return {
    theme: data.theme || 'light',
    language: data.language || 'pt-BR',
    plan: data.plan || 'free',
    summaryOrder: data.summary_order || ['income', 'expense', 'paid', 'balance'],
    notificationPrefs: notifPrefs,
    customCategories: notifPrefs.customCategories || [],
  };
}

export async function dbSaveUserPreferences(prefs) {
  const userId = await getUserId();
  if (!userId) return false;
  // Only include fields that were explicitly passed — never overwrite plan accidentally
  const row = { user_id: userId, updated_at: new Date().toISOString() };
  if (prefs.theme !== undefined) row.theme = prefs.theme;
  if (prefs.language !== undefined) row.language = prefs.language;
  if (prefs.plan !== undefined) row.plan = prefs.plan;
  if (prefs.summaryOrder !== undefined) row.summary_order = prefs.summaryOrder;
  if (prefs.notificationPrefs !== undefined) row.notification_prefs = prefs.notificationPrefs;
  if (prefs.customCategories !== undefined) row.notification_prefs = { ...(row.notification_prefs || {}), customCategories: prefs.customCategories };
  const { error } = await supabase
    .from('user_preferences')
    .upsert(row);
  if (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
  return true;
}

// --- CONNECTED BANKS ---

export async function dbLoadConnectedBanks() {
  const { data, error } = await supabase
    .from('connected_banks')
    .select('*');
  if (error) {
    console.error('Error loading connected banks:', error);
    return [];
  }
  return data.map(toCamelCase);
}

export async function dbSaveConnectedBank(bank) {
  const userId = await getUserId();
  if (!userId) return false;
  const row = {
    id: bank.itemId || bank.id,
    user_id: userId,
    item_id: bank.itemId || bank.id,
    connector_name: bank.name || bank.connectorName || '',
    connected_at: bank.connectedAt || new Date().toISOString(),
  };
  const { error } = await supabase.from('connected_banks').upsert(row);
  if (error) {
    console.error('Error saving connected bank:', error);
    return false;
  }
  return true;
}

export async function dbDeleteConnectedBank(itemId) {
  const { error } = await supabase.from('connected_banks').delete().eq('item_id', itemId);
  if (error) {
    console.error('Error deleting connected bank:', error);
    return false;
  }
  return true;
}
