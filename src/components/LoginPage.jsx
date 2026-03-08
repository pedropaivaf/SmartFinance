import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';

const logoBlue = '/LogoSFblue.png';

const inputBase =
  'w-full block text-sm px-4 py-3.5 rounded-xl border border-slate-300/80 dark:border-slate-700 ' +
  'bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ' +
  'focus:ring-sky-500 focus:border-sky-500 transition leading-tight';

function LoginPage({ onSignIn, onSwitchToRegister, onSwitchToForgotPassword }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await onSignIn(email, password);
    setLoading(false);
    if (err) {
      setError(t('auth.error.invalidCredentials') || 'Email ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src={logoBlue} alt="Smart Finance" className="h-16 w-16 mx-auto mb-4 rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Finance</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('auth.login.subtitle') || 'Entre para acessar suas financas'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              {t('auth.email') || 'Email'}
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={inputBase}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              {t('auth.password') || 'Senha'}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className={`${inputBase} pr-12`}
                required
                autoComplete="current-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 text-sky-500 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {t('auth.login.rememberMe') || 'Lembrar de mim'}
              </span>
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm font-medium text-sky-500 hover:text-sky-400 transition"
            >
              {t('auth.login.forgotPassword') || 'Esqueci minha senha'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition duration-300 shadow-lg shadow-sky-500/25"
          >
            {loading ? (t('auth.loading') || 'Entrando...') : (t('auth.login.button') || 'Entrar')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t('auth.login.noAccount') || 'Nao tem uma conta?'}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-sky-500 hover:text-sky-400 transition"
          >
            {t('auth.login.createAccount') || 'Criar conta'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
