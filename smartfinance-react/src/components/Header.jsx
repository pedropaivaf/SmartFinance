import React from 'react';

function Header({ isDarkMode, onToggleTheme, logoSrc, onToggleMenu, isMenuOpen }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 p-2 text-slate-600 dark:text-slate-300 sm:hidden"
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src={logoSrc} alt="Logo do Smart Finance" className="w-12 h-12 sm:w-14 sm:h-14" />
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Finance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Controle suas finanças de forma inteligente e acompanhe suas metas.
          </p>
        </div>
      </div>
      <button
        id="theme-toggle"
        type="button"
        onClick={onToggleTheme}
        className="self-center sm:self-auto text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 rounded-lg text-sm p-2.5"
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