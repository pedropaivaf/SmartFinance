import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';

const logoBlue = '/LogoSFblue.png';

const inputBase =
  'w-full block text-sm px-4 py-3.5 rounded-xl border border-[#E8E5E0] dark:border-[#2D2B28] ' +
  'bg-white dark:bg-[#1E1D1C] text-[#1A1A1A] dark:text-[#E8E4DF] ' +
  'placeholder:text-[#9B9B9B] dark:placeholder:text-[#6B6560] focus:outline-none focus:ring-2 ' +
  'focus:ring-[#1B4965] focus:border-[#1B4965] transition leading-tight';

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
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAF8] dark:bg-[#111110]">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F0F4] dark:bg-[#1B2B35] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-[#E8E4DF]">
            {t('auth.reset.successTitle') || 'Email enviado!'}
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92]">
            {t('auth.reset.successMessage') || 'Verifique sua caixa de entrada (e spam) para o link de recuperacao de senha.'}
          </p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full bg-[#1B4965] hover:bg-[#153B52] text-white font-semibold py-3.5 px-4 rounded-xl transition duration-300 shadow-md"
          >
            {t('auth.reset.backToLogin') || 'Voltar ao login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAF8] dark:bg-[#111110]">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src={logoBlue} alt="Smart Finance" className="h-16 w-16 mx-auto mb-4 rounded-2xl shadow-md" />
          <h1 className="text-2xl font-bold font-serif text-[#1A1A1A] dark:text-[#E8E4DF]">
            {t('auth.reset.title') || 'Recuperar senha'}
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A09A92]">
            {t('auth.reset.subtitle') || 'Digite seu email para receber o link de recuperacao'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#9B2226] dark:text-[#E76F51] text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reset-email" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
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
            className="w-full bg-[#1B4965] hover:bg-[#153B52] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition duration-300 shadow-md"
          >
            {loading ? (t('auth.loading') || 'Enviando...') : (t('auth.reset.button') || 'Enviar link de recuperacao')}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B6B6B] dark:text-[#A09A92]">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-[#1B4965] hover:text-[#153B52] dark:text-[#5FA8D3] dark:hover:text-[#4A93BD] transition"
          >
            {t('auth.reset.backToLogin') || 'Voltar ao login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
