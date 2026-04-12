import React, { useState } from 'react';
import PremiumBadge from './PremiumBadge';
import PaywallModal from './PaywallModal.jsx';
import { useTranslation } from '../i18n/index.jsx';

export default function PremiumCard({ title, description, icon, onClick }) {
  const { t } = useTranslation();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleClick = onClick || (() => setShowPaywall(true));

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 transition-all hover:shadow-lg">
        <div className="absolute top-3 right-3">
          <PremiumBadge size="sm" />
        </div>

        {icon && (
          <div className="mb-3 text-amber-500 dark:text-amber-400">
            {icon}
          </div>
        )}

        <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#E8E4DF] mb-2">
          {title}
        </h3>

        <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mb-4">
          {description}
        </p>

        <button
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md min-h-[44px]"
        >
          {t('paywall.cta')}
        </button>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={() => setShowPaywall(false)}
        onRestore={() => setShowPaywall(false)}
      />
    </>
  );
}
