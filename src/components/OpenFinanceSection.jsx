/**
 * OpenFinanceSection — Full UI flow for Pluggy Open Finance integration
 *
 * States: idle → loading → widget → importing → done
 *
 * Features:
 *   - Auto-categorization of transactions
 *   - Credit card transactions separated (unpaid, with card name)
 *   - Checking account transactions (already paid)
 *   - Grouped preview by type before importing
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import {
  getConnectToken,
  fetchAccounts,
  fetchTransactions,
  mapPluggyTransaction,
  deduplicateTransactions,
  loadConnectedBanks,
  saveConnectedBanks,
  removeConnectedBank,
  SUPPORTED_BANKS,
} from '../services/openFinanceService.js';

const PLUGGY_WIDGET_URL = 'https://cdn.pluggy.ai/pluggy-connect.js';

export default function OpenFinanceSection({ existingTransactions = [], onImport }) {
  const { t, lang } = useTranslation();

  const [phase, setPhase] = useState('idle');
  const [connectedBanks, setConnectedBanks] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [importStats, setImportStats] = useState(null);
  const pluggyConnectRef = useRef(null);

  // Load connected banks (async — Supabase + localStorage fallback)
  useEffect(() => {
    loadConnectedBanks().then(setConnectedBanks).catch(() => {});
  }, []);

  // Load Pluggy Connect script once
  useEffect(() => {
    if (document.getElementById('pluggy-connect-script')) return;
    const script = document.createElement('script');
    script.id = 'pluggy-connect-script';
    script.src = PLUGGY_WIDGET_URL;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Group pending transactions for preview
  const grouped = useMemo(() => {
    if (!pendingTransactions.length) return null;
    const creditCard = pendingTransactions.filter((tx) => tx.accountType === 'credit');
    const checking = pendingTransactions.filter((tx) => tx.accountType !== 'credit');
    const income = checking.filter((tx) => tx.type === 'income');
    const expenses = checking.filter((tx) => tx.type === 'expense');

    // Group credit card by card name
    const cardGroups = {};
    creditCard.forEach((tx) => {
      const key = tx.creditCardName || 'Cartão';
      if (!cardGroups[key]) cardGroups[key] = [];
      cardGroups[key].push(tx);
    });

    return { income, expenses, cardGroups, creditCard, total: pendingTransactions.length };
  }, [pendingTransactions]);

  const handleConnect = async () => {
    setError('');
    setPhase('loading');
    try {
      const { connectToken } = await getConnectToken();
      setPhase('widget');

      let attempts = 0;
      while (!window.PluggyConnect && attempts < 30) {
        await new Promise((r) => setTimeout(r, 200));
        attempts++;
      }
      if (!window.PluggyConnect) throw new Error('Pluggy widget not loaded');

      pluggyConnectRef.current = new window.PluggyConnect({
        connectToken,
        onSuccess: async ({ item }) => {
          pluggyConnectRef.current?.destroy?.();
          setPhase('importing');
          await handleItemConnected(item);
        },
        onError: (err) => {
          setError(err.message || t('settings.openfinance.error'));
          setPhase('idle');
        },
        onClose: () => {
          setPhase((prev) => prev === 'done' || prev === 'importing' ? prev : 'idle');
        },
      });
      pluggyConnectRef.current.init();
    } catch (err) {
      const msg = err.message?.includes('503') || err.message?.includes('Failed to fetch')
        ? t('settings.openfinance.configMissing')
        : err.message?.includes('credentials')
          ? t('settings.openfinance.configMissing')
          : t('settings.openfinance.error');
      setError(msg);
      setPhase('idle');
    }
  };

  const handleItemConnected = async (item) => {
    try {
      const accounts = await fetchAccounts(item.id);
      const allTransactions = [];

      for (const account of accounts) {
        const txs = await fetchTransactions(account.id);
        txs.forEach((tx) =>
          allTransactions.push(mapPluggyTransaction(tx, item.connector?.name ?? '', account))
        );
      }

      const newTxs = deduplicateTransactions(allTransactions, existingTransactions);
      setPendingTransactions(newTxs);

      const bankInfo = {
        itemId: item.id,
        name: item.connector?.name ?? 'Banco',
        logo: item.connector?.imageUrl ?? '',
        connectedAt: new Date().toISOString(),
      };
      const updated = [...connectedBanks.filter((b) => b.itemId !== item.id), bankInfo];
      setConnectedBanks(updated);
      await saveConnectedBanks(updated);

      setPhase('done');
    } catch (err) {
      console.error('Open Finance import error:', err);
      setError(t('settings.openfinance.error'));
      setPhase('idle');
    }
  };

  const handleImport = () => {
    if (!pendingTransactions.length) return;
    const creditCount = pendingTransactions.filter((tx) => tx.accountType === 'credit').length;
    const incomeCount = pendingTransactions.filter((tx) => tx.type === 'income').length;
    const expenseCount = pendingTransactions.filter((tx) => tx.type === 'expense' && tx.accountType !== 'credit').length;

    onImport(pendingTransactions);
    setImportedCount(pendingTransactions.length);
    setImportStats({ creditCount, incomeCount, expenseCount });
    setPendingTransactions([]);
  };

  const handleDisconnect = async (itemId) => {
    const updated = connectedBanks.filter((b) => b.itemId !== itemId);
    setConnectedBanks(updated);
    await removeConnectedBank(itemId);
    if (phase === 'done' || phase === 'importing') {
      setPendingTransactions([]);
      setPhase('idle');
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency: 'BRL' }).format(Math.abs(val));

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(lang, { day: '2-digit', month: 'short' });

  return (
    <div className="space-y-4">
      {/* Security notice */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-xs text-emerald-700 dark:text-emerald-300">{t('settings.openfinance.securityNote')}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2.5 bg-red-50 dark:bg-red-950/30 rounded-xl">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Connected banks */}
      {connectedBanks.length > 0 && (
        <div className="space-y-2">
          {connectedBanks.map((bank) => (
            <div key={bank.itemId} className="flex items-center justify-between px-4 py-3 glass-panel rounded-2xl">
              <div className="flex items-center gap-3">
                {bank.logo
                  ? <img src={bank.logo} alt={bank.name} className="w-8 h-8 rounded-full object-contain" />
                  : <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">🏦</span>
                }
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{bank.name}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{t('settings.openfinance.connected')}</p>
                </div>
              </div>
              <button type="button" onClick={() => handleDisconnect(bank.itemId)}
                className="text-xs text-red-500 dark:text-red-400 hover:underline">
                {t('settings.openfinance.disconnect')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Import success stats */}
      {phase === 'done' && importedCount > 0 && importStats && (
        <div className="px-4 py-3 bg-sky-50 dark:bg-sky-950/30 rounded-xl space-y-1.5">
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
            {t('settings.openfinance.success', { count: importedCount })}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {importStats.incomeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {importStats.incomeCount} entradas
              </span>
            )}
            {importStats.expenseCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                {importStats.expenseCount} despesas
              </span>
            )}
            {importStats.creditCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                {importStats.creditCount} fatura cartão
              </span>
            )}
          </div>
        </div>
      )}

      {/* Importing spinner */}
      {phase === 'importing' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">Importando transações...</p>
        </div>
      )}

      {/* Pending transactions — grouped preview */}
      {phase === 'done' && grouped && grouped.total > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('settings.openfinance.review')} ({grouped.total})
          </p>

          {/* Income */}
          {grouped.income.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 px-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                Entradas ({grouped.income.length})
              </p>
              <div className="rounded-xl glass-panel divide-y divide-slate-100/80 dark:divide-slate-700/40 max-h-32 overflow-y-auto">
                {grouped.income.map((tx) => (
                  <TxRow key={tx.id} tx={tx} formatCurrency={formatCurrency} formatDate={formatDate} />
                ))}
              </div>
            </div>
          )}

          {/* Expenses (checking) */}
          {grouped.expenses.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 px-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
                Despesas ({grouped.expenses.length})
              </p>
              <div className="rounded-xl glass-panel divide-y divide-slate-100/80 dark:divide-slate-700/40 max-h-40 overflow-y-auto">
                {grouped.expenses.map((tx) => (
                  <TxRow key={tx.id} tx={tx} formatCurrency={formatCurrency} formatDate={formatDate} />
                ))}
              </div>
            </div>
          )}

          {/* Credit card groups */}
          {Object.entries(grouped.cardGroups).map(([cardName, txs]) => (
            <div key={cardName} className="space-y-1">
              <p className="text-xs font-medium text-violet-600 dark:text-violet-400 px-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {cardName} — Fatura ({txs.length})
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  Pendente
                </span>
              </p>
              <div className="rounded-xl glass-panel divide-y divide-slate-100/80 dark:divide-slate-700/40 max-h-40 overflow-y-auto">
                {txs.map((tx) => (
                  <TxRow key={tx.id} tx={tx} formatCurrency={formatCurrency} formatDate={formatDate} />
                ))}
              </div>
            </div>
          ))}

          <button type="button" onClick={handleImport}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors">
            {t('settings.openfinance.confirmImport', { count: grouped.total })}
          </button>
        </div>
      )}

      {phase === 'done' && pendingTransactions.length === 0 && importedCount === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
          {t('settings.openfinance.noNew')}
        </p>
      )}

      {/* Connect button */}
      {(phase === 'idle' || phase === 'loading') && (
        <button type="button" onClick={handleConnect} disabled={phase === 'loading'}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-colors focus:outline-none ${
            phase === 'loading'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-wait'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}>
          {phase === 'loading' ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('common.loading')}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {t('settings.openfinance.connect')}
            </>
          )}
        </button>
      )}

      {/* Supported banks */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('settings.openfinance.banks')}</p>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_BANKS.map((bank) => (
            <span key={bank.connector} className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {bank.logo} {bank.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Transaction row for preview
function TxRow({ tx, formatCurrency, formatDate }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.description}</p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(tx.createdAt)}</span>
          {tx.category && tx.category !== 'Outros' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              {tx.category}
            </span>
          )}
          {tx.paymentMethod === 'pix' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">Pix</span>
          )}
        </div>
      </div>
      <p className={`text-sm font-semibold flex-shrink-0 ${
        tx.type === 'income' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
      </p>
    </div>
  );
}
