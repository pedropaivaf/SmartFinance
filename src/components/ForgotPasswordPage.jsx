import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';

const logoBlue = '/LogoSFblue.png';

const inputBase =
  'w-full block text-sm px-4 py-3.5 rounded-xl border border-slate-300/80 dark:border-slate-700 ' +
  'bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ' +
  'focus:ring-sky-500 focus:border-sky-500 transition leading-tight';

function ForgotPasswordPage({ onResetPassword, onSwitchToLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await onResetPassword(email);
    setLoading(false);
    if (err) {
      setError(t('auth.error.resetFailed') || 'Erro ao enviar email de recuperacao. Tente novamente.');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('auth.reset.successTitle') || 'Email enviado!'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('auth.reset.successMessage') || 'Verifique sua caixa de entrada (e spam) para o link de recuperacao de senha.'}
          </p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3.5 px-4 rounded-xl transition duration-300 shadow-lg shadow-sky-500/25"
          >
            {t('auth.reset.backToLogin') || 'Voltar ao login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src={logoBlue} alt="Smart Finance" className="h-16 w-16 mx-auto mb-4 rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('auth.reset.title') || 'Recuperar senha'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('auth.reset.subtitle') || 'Digite seu email para receber o link de recuperacao'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reset-email" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              {t('auth.email') || 'Email'}
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={inputBase}
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition duration-300 shadow-lg shadow-sky-500/25"
          >
            {loading ? (t('auth.loading') || 'Enviando...') : (t('auth.reset.button') || 'Enviar link de recuperacao')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-sky-500 hover:text-sky-400 transition"
          >
            {t('auth.reset.backToLogin') || 'Voltar ao login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
