import React from 'react';
import { useTranslation } from '../i18n/index.jsx';

const logoBlue = '/LogoSFblue.png';

const navItems = [
  {
    id: 'overview',
    labelKey: 'nav.home',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    id: 'graphs-goals',
    labelKey: 'nav.chart',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 3v18M6 8v13M16 13v8" />,
  },
  {
    id: 'new-transaction',
    labelKey: 'nav.new',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />,
  },
  {
    id: 'history',
    labelKey: 'nav.history',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    id: 'settings',
    labelKey: 'nav.config',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
];

function DesktopSidebar({ activePage, onNavigate, userEmail, onSignOut }) {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <img src={logoBlue} alt="Smart Finance" className="h-10 w-10 rounded-xl shadow-md" />
        <span className="text-lg font-bold text-slate-900 dark:text-white">Smart Finance</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isActive ? 2.2 : 1.8}
              >
                {item.icon}
              </svg>
              {t(item.labelKey) || item.id}
            </button>
          );
        })}
      </nav>

      {/* User info + sign out */}
      <div className="px-4 py-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3">
        {userEmail && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate px-2">
            {userEmail}
          </p>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t('settings.signOut') || 'Sair'}
        </button>
      </div>
    </aside>
  );
}

export default DesktopSidebar;
