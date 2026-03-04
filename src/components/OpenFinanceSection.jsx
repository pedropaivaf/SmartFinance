/**
 * OpenFinanceSection — Full UI flow for Pluggy Open Finance integration
 *
 * States: idle → loading → widget → connected → importing → done
 *
 * SECURITY NOTE:
 *   - connectToken is kept only in component state (memory), never persisted
 *   - All API calls go through /api/pluggy proxy (server-side auth)
 *   - Bank credentials never touch this app — they go directly to each bank via Pluggy
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import {
  getConnectToken,
  fetchAccounts,
  fetchTransactions,
  mapPluggyTransaction,
  deduplicateTransactions,
  loadConnectedBanks,
  saveConnectedBanks,
  SUPPORTED_BANKS,
} from '../services/openFinanceService.js';

const PLUGGY_WIDGET_URL = 'https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.js';

export default function OpenFinanceSection({ existingTransactions = [], onImport }) {
  const { t } = useTranslation();

  const [phase, setPhase] = useState('idle'); // idle | loading | widget | importing | done
  const [connectedBanks, setConnectedBanks] = useState(() => loadConnectedBanks());
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const widgetRef = useRef(null);
  const pluggyConnectRef = useRef(null);

  // Load Pluggy Connect script once
  useEffect(() => {
    const existing = document.getElementById('pluggy-connect-script');
    if (existing) return;
    const script = document.createElement('script');
    script.id = 'pluggy-connect-script';
    script.src = PLUGGY_WIDGET_URL;
    script.async = true;
    document.body.appendChild(script);
    return () => { /* keep script in DOM */ };
  }, []);

  const handleConnect = async () => {
    setError('');
    setPhase('loading');
    try {
      const { connectToken } = await getConnectToken();
      setPhase('widget');

      // Wait for PluggyConnect global to be available
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
          if (phase !== 'done') setPhase('idle');
        },
      });
      pluggyConnectRef.current.init();
    } catch (err) {
      const msg = err.message?.includes('Proxy error 503') || err.message?.includes('Failed to fetch')
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
        txs.forEach((tx) => allTransactions.push(mapPluggyTransaction(tx, item.connector?.name ?? '')));
      }

      const newTxs = deduplicateTransactions(allTransactions, existingTransactions);
      setPendingTransactions(newTxs);

      // Save connected bank info (no tokens — just display metadata)
      const bankInfo = {
        itemId: item.id,
        name: item.connector?.name ?? 'Banco',
        logo: item.connector?.imageUrl ?? '',
        connectedAt: new Date().toISOString(),
      };
      const updated = [...connectedBanks.filter((b) => b.itemId !== item.id), bankInfo];
      setConnectedBanks(updated);
      saveConnectedBanks(updated);

      setPhase('done');
    } catch (err) {
      setError(t('settings.openfinance.error'));
      setPhase('idle');
    }
  };

  const handleImport = () => {
    if (!pendingTransactions.length) return;
    onImport(pendingTransactions);
    setImportedCount(pendingTransactions.length);
    setPendingTransactions([]);
  };

  const handleDisconnect = (itemId) => {
    const updated = connectedBanks.filter((b) => b.itemId !== itemId);
    setConnectedBanks(updated);
    saveConnectedBanks(updated);
    if (phase === 'done' || phase === 'importing') {
      setPendingTransactions([]);
      setPhase('idle');
    }
  };

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
            <div key={bank.itemId} className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-800/80 rounded-2xl shadow-sm">
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
              <button
                type="button"
                onClick={() => handleDisconnect(bank.itemId)}
                className="text-xs text-red-500 dark:text-red-400 hover:underline"
              >
                {t('settings.openfinance.disconnect')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Import result */}
      {phase === 'done' && importedCount > 0 && (
        <div className="px-3 py-2.5 bg-sky-50 dark:bg-sky-950/30 rounded-xl">
          <p className="text-xs text-sky-700 dark:text-sky-300">{t('settings.openfinance.success', { count: importedCount })}</p>
        </div>
      )}

      {/* Pending transactions to import */}
      {phase === 'done' && pendingTransactions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('settings.openfinance.review')}</p>
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl bg-white/90 dark:bg-slate-800/80 shadow-sm divide-y divide-slate-100 dark:divide-slate-700/50">
            {pendingTransactions.slice(0, 20).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-semibold flex-shrink-0 ml-2 ${tx.type === 'income' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2)}
                </p>
              </div>
            ))}
            {pendingTransactions.length > 20 && (
              <p className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500">
                + {pendingTransactions.length - 20} mais transações
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleImport}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors"
          >
            {t('settings.openfinance.confirmImport', { count: pendingTransactions.length })}
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
        <button
          type="button"
          onClick={handleConnect}
          disabled={phase === 'loading'}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-colors focus:outline-none ${
            phase === 'loading'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-wait'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
        >
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
