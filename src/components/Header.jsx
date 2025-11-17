import React from 'react';

function Header({ isDarkMode, onToggleTheme, logoSrc }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 px-4 sm:px-6 py-4 shadow-md shadow-slate-900/5 dark:shadow-black/30 backdrop-blur-sm">
      <div className="flex items-center gap-3 sm:gap-4">
        <img src={logoSrc} alt="Logo do Smart Finance" className="w-12 h-12 sm:w-14 sm:h-14" />
        <div className="text-left">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Dashboard</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight">Smart Finance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tudo em um lugar, mais limpo para o seu dia a dia.
          </p>
        </div>
      </div>
      <button
        id="theme-toggle"
        type="button"
        onClick={onToggleTheme}
        className="shrink-0 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 rounded-full p-2.5 transition"
        aria-label="Alternar entre tema claro e escuro"
      >
        <span className="sr-only">Alternar tema</span>
        <svg
          id="theme-toggle-dark-icon"
          className={`${isDarkMode ? 'hidden' : 'block'} w-5 h-5`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
        <svg
          id="theme-toggle-light-icon"
          className={`${isDarkMode ? 'block' : 'hidden'} w-5 h-5`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 10.607a1 1 0 011.414 0l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

export default Header;
