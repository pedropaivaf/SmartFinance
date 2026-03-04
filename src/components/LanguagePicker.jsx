import React from 'react';
import { useTranslation, LANGUAGES } from '../i18n/index.jsx';

export default function LanguagePicker({ isOpen, onClose }) {
  const { t, lang, setLang } = useTranslation();

  if (!isOpen) return null;

  const handleSelect = (code) => {
    setLang(code);
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Title */}
        <div className="px-6 pt-3 pb-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white text-center">
            {t('language.picker.title')}
          </h2>
        </div>

        {/* Language options */}
        <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {Object.entries(LANGUAGES).map(([code, { flag, name }]) => {
            const isSelected = code === lang;
            return (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => handleSelect(code)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 active:bg-slate-100 dark:active:bg-slate-700/60 transition-colors text-left"
                >
                  <span className="text-2xl">{flag}</span>
                  <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-sky-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {name}
                  </span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Close button */}
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
