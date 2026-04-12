import React from 'react';
import { useTranslation } from '../i18n/index.jsx';

function SyrosLogo({ className = "w-11 h-11 sm:w-12 sm:h-12" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="13" fill="url(#syros-grad)" />
      {/* Faint island silhouette of Syros */}
      <path
        d="M24 7.5C29 7.5 34 12.5 34.5 18.5C35 24.5 32 29 29 33.5C26 38 24.5 41 21.5 41C18.5 41 15.5 37 14.5 32C13.5 27 13.5 22 14.5 17C15.5 12 19 7.5 24 7.5Z"
        fill="white" opacity="0.07"
      />
      {/* S with organic island-coastline curves — wider north, narrower south */}
      <path
        d="M30 14C28 12 25 10.5 22.5 10.5C17.5 10.5 13.5 14 13.5 18.5C13.5 22.5 17 24.5 21.5 26.5C26 28.5 30 30.5 30 34.5C30 37.5 27.5 39.5 24 39.5C21 39.5 19 38 17.5 36.5"
        stroke="white" strokeWidth="3.2" strokeLinecap="round"
      />
      <defs>
        <linearGradient id="syros-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#143A52" />
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
