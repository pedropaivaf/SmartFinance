import React from 'react';
import { useTranslation } from '../i18n/index.jsx';

function Header({ logoSrc }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 sm:gap-4 pt-2 pb-1">
      <div className="relative float-subtle">
        <img src={logoSrc} alt="Logo do Smart Finance" className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-lg" />
        <div className="absolute -inset-1 bg-sky-400/20 dark:bg-sky-400/10 rounded-full blur-lg -z-10" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gradient leading-tight tracking-tight">
          {t('app.name')}
        </h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wide">
          {t('app.subtitle')}
        </p>
      </div>
    </div>
  );
}

export default Header;
