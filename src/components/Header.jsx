import React from 'react';
import { useTranslation } from '../i18n/index.jsx';

function Header({ logoSrc }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 sm:gap-4 pt-2 pb-1">
      <div className="relative">
        <img src={logoSrc} alt="Logo do Smart Finance" className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-md" />
      </div>
      <div>
        <h1 className="text-xl font-serif text-[#1A1A1A] dark:text-[#E8E4DF] leading-tight tracking-tight">
          {t('app.name')}
        </h1>
        <p className="text-[11px] text-[#9B9B9B] dark:text-[#6B6560] tracking-wide">
          {t('app.subtitle')}
        </p>
      </div>
    </div>
  );
}

export default Header;
