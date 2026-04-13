import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/index.jsx';
import { PACKAGES, PREMIUM_FEATURES, formatPrice, monthlyEquivalent, getPrice } from '../paywall/packages.js';
import { isNativeApp } from '../utils/platform.js';
import {
  getPackageByIdentifier,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  extractPremiumPayload,
} from '../services/purchases.js';
import { dbSaveUserPreferences } from '../services/supabaseService.js';
import { createCheckoutSession } from '../services/checkout.js';
import { setCurrentPlan } from '../config.js';

function PaywallModal({ isOpen, onClose, onPurchase, onRestore }) {
  const { t, lang } = useTranslation();
  const [selected, setSelected] = useState('annual');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const native = isNativeApp();
  const monthly = PACKAGES.monthly;
  const annual = PACKAGES.annual;
  const monthlyPrice = getPrice(monthly, native);
  const annualPrice = getPrice(annual, native);
  const annualEquiv = monthlyEquivalent(annualPrice);
  const discountPct = Math.round((1 - annualEquiv / monthlyPrice) * 100);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !busy) onClose();
  };

  const applyEntitlementFromInfo = async () => {
    const info = await getCustomerInfo();
    const payload = extractPremiumPayload(info);
    if (!payload) return false;
    setCurrentPlan('premium');
    await dbSaveUserPreferences(payload);
    return true;
  };

  const handleSubscribe = async () => {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      if (native) {
        const pkg = PACKAGES[selected];
        const rcPackage = await getPackageByIdentifier(pkg.id);
        if (!rcPackage) {
          setErrorMsg(t('paywall.error.unavailable'));
          return;
        }
        const res = await purchasePackage(rcPackage);
        if (res.cancelled) return;
        if (!res.ok) {
          setErrorMsg(t('paywall.error.generic'));
          return;
        }
        await applyEntitlementFromInfo();
        onClose();
      } else {
        if (onPurchase) {
          await onPurchase(selected);
          return;
        }
        const res = await createCheckoutSession(selected);
        if (!res.ok) {
          setErrorMsg(t('paywall.error.generic'));
          return;
        }
        window.location.href = res.url;
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      if (native) {
        const res = await restorePurchases();
        if (!res.ok) {
          setErrorMsg(t('paywall.error.generic'));
          return;
        }
        const found = await applyEntitlementFromInfo();
        if (!found) {
          setErrorMsg(t('paywall.error.nothingToRestore'));
          return;
        }
        onClose();
      } else if (onRestore) {
        await onRestore();
      }
    } finally {
      setBusy(false);
    }
  };

  const PlanCard = ({ id, title, price, subtitle, badge, highlighted }) => {
    const active = selected === id;
    return (
      <button
        type="button"
        onClick={() => setSelected(id)}
        className={`relative w-full text-left rounded-2xl p-4 transition-all duration-200 ${
          active
            ? 'bg-[#1B4965] dark:bg-[#5FA8D3] text-white shadow-md ring-2 ring-[#1B4965] dark:ring-[#5FA8D3]'
            : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] ring-1 ring-[#E8E5E0] dark:ring-[#2D2B28]'
        }`}
      >
        {badge && (
          <span className={`absolute -top-2 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            active ? 'bg-white text-[#1B4965]' : 'bg-[#1B4965] dark:bg-[#5FA8D3] text-white'
          }`}>
            {badge}
          </span>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider opacity-75 font-semibold">{title}</p>
            <p className="mt-1 text-xl font-display font-bold leading-tight">
              {formatPrice(price, lang)}
            </p>
            {subtitle && <p className="mt-0.5 text-[11px] opacity-75">{subtitle}</p>}
          </div>
          <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            active ? 'border-white bg-white' : 'border-[#9B9B9B] dark:border-[#6B6560]'
          }`}>
            {active && (
              <svg className="w-3 h-3 text-[#1B4965]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </div>
      </button>
    );
  };

  return ReactDOM.createPortal(
    <div
      className="modal-overlay fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
      <div className="modal-container animate-slide-up w-full sm:w-[calc(100%-32px)] sm:max-w-sm bg-white dark:bg-[#1E1D1C] rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative px-5 pt-5 pb-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t('common.close') || 'Fechar'}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-[#F4F3EF] dark:hover:bg-[#2D2B28] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9B9B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B4965] to-[#5FA8D3] flex items-center justify-center shadow-md shadow-[#1B4965]/25 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" />
            </svg>
          </div>
          <h2 className="text-center text-xl font-display font-bold text-[#1A1A1A] dark:text-[#E8E4DF]">
            {t('paywall.title')}
          </h2>
          <p className="mt-1 text-center text-sm text-[#6B6B6B] dark:text-[#A09A92]">
            {t('paywall.subtitle')}
          </p>
        </div>

        {/* Plans */}
        <div className="px-5 pt-2 pb-4 space-y-3">
          <PlanCard
            id="annual"
            title={t('paywall.annual.title')}
            price={annualPrice}
            subtitle={`${formatPrice(annualEquiv, lang)}${t('paywall.perMonth')}`}
            badge={discountPct > 0 ? `-${discountPct}%` : null}
            highlighted
          />
          <PlanCard
            id="monthly"
            title={t('paywall.monthly.title')}
            price={monthlyPrice}
            subtitle={t('paywall.perMonth').replace('/', '')}
          />
        </div>

        {/* Trial badge */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-semibold">{t('paywall.trial.label')}</span>
          </div>
        </div>

        {/* Features list */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-1.5">
          {PREMIUM_FEATURES.map((feat) => (
            <div key={feat} className="flex items-center gap-2.5 py-1 text-sm text-[#1A1A1A] dark:text-[#E8E4DF]">
              <svg className="h-4 w-4 text-[#1B4965] dark:text-[#5FA8D3] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t(`paywall.features.${feat}`)}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pt-2 pb-5 space-y-2.5 border-t border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1E1D1C]">
          {errorMsg && (
            <p className="text-center text-xs text-rose-500 dark:text-rose-400">{errorMsg}</p>
          )}
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={busy}
            className="w-full min-h-[48px] rounded-xl bg-[#1B4965] dark:bg-[#5FA8D3] text-white font-semibold shadow-md shadow-[#1B4965]/25 hover:bg-[#143A52] dark:hover:bg-[#4A97C2] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {busy ? '…' : t('paywall.cta')}
          </button>
          <div className="flex items-center justify-between text-[11px] text-[#9B9B9B] dark:text-[#6B6560]">
            <button type="button" onClick={handleRestore} disabled={busy} className="underline hover:text-[#1B4965] dark:hover:text-[#5FA8D3] transition-colors disabled:opacity-60">
              {t('paywall.restore')}
            </button>
            <span>{t('paywall.terms')}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PaywallModal;
