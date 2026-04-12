import React from 'react';
import { useTranslation } from '../i18n/index.jsx';

function SyrosLogo({ className = "w-11 h-11 sm:w-12 sm:h-12" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="12" fill="url(#syros-grad)" />
      <path d="M16 18.5C16 15.5 18.5 13 22 13h4c3.5 0 6 2.5 6 5.5 0 3-2 4.5-4 5.5l-8 4c-2 1-4 2.5-4 5.5 0 3 2.5 5.5 6 5.5h4c3.5 0 6-2.5 6-5.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16.5" cy="18.5" r="1.5" fill="white" opacity="0.6" />
      <circle cx="31.5" cy="34" r="1.5" fill="white" opacity="0.6" />
      <defs>
        <linearGradient id="syros-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1B4965" />
          <stop offset="1" stopColor="#5FA8D3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Header() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 sm:gap-4 pt-2 pb-1">
      <div className="relative">
        <SyrosLogo />
      </div>
      <h1 className="text-xl font-display text-[#1A1A1A] dark:text-[#E8E4DF] leading-tight tracking-tight">
        {t('app.name')}
      </h1>
    </div>
  );
}

export { SyrosLogo };

export default Header;
