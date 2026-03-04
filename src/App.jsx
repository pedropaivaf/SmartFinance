/**
 * SmartFinance - App Principal
 *
 * Versão 2.0.0 - Premium/Freemium
 *
 * Sistema de Feature Flags:
 * - Altere em src/config.js o valor de SMARTFINANCE_CONFIG.plan para 'premium' ou 'free'
 *
 * Novos Recursos Premium:
 * - Envelopes por categoria
 * - Insights automáticos
 * - Cartões de crédito e faturas
 * - Próximos lançamentos e lembretes
 * - Análises avançadas
 * - Export e backup de dados
 */

import React, { useEffect, useMemo, useState } from 'react';

// Componentes existentes
import Header from './components/Header.jsx';
import GoalsSection from './components/GoalsSection.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import ChartSection from './components/ChartSection.jsx';
import FilterBar from './components/FilterBar.jsx';
import PaymentTabs from './components/PaymentTabs.jsx';
import TransactionList from './components/TransactionList.jsx';
import EditTransactionModal from './components/EditTransactionModal.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import ConfirmDeleteModal from './components/ConfirmDeleteModal.jsx';
import DeleteChoiceModal from './components/DeleteChoiceModal.jsx';
import EditChoiceModal from './components/EditChoiceModal.jsx';
import EditAllValueModal from './components/EditAllValueModal.jsx';

// Novos componentes Premium
import InsightsSection from './components/InsightsSection.jsx';
import EnvelopesSection from './components/EnvelopesSection.jsx';
import UpcomingBillsSection from './components/UpcomingBillsSection.jsx';
import CreditCardsSection from './components/CreditCardsSection.jsx';
import AdvancedAnalytics from './components/AdvancedAnalytics.jsx';
import ExportSection from './components/ExportSection.jsx';
import SettingsSection from './components/SettingsSection.jsx';

// i18n
import { LanguageProvider, useTranslation } from './i18n/index.jsx';

// Services
import {
  loadTransactions,
  saveTransactions,
  loadGoals,
  saveGoals,
  loadEnvelopes,
  saveEnvelopes,
  loadCards,
  saveCards,
  loadTheme,
  saveTheme,
} from './services/storageService.js';
import {
  loadNotificationPrefs,
  runNotificationChecks,
} from './services/notificationService.js';

const logoBlue = '/LogoSFblue.png';

function NavTab({ target, label, activePage, onNavigate, children }) {
  const isActive = activePage === target;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onNavigate(target)}
      className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-[44px] min-h-[44px] text-xs transition-all duration-200 focus:outline-none ${
        isActive ? 'nav-tab-active' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isActive ? 2.5 : 1.8}
      >
        {children}
      </svg>
      <span className={`transition-all duration-200 ${isActive ? 'font-semibold' : 'font-normal'}`}>{label}</span>
    </button>
  );
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(value) ? value : 0);

const generateProcessedTransactions = (transactions) => {
  const today = new Date();
  const projectionEndDate = new Date(today.getFullYear() + 1, 11, 31);
  const processed = [...transactions];
  const signatures = new Set();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    const signature = `${transaction.sourceOf || transaction.id}-${date.getFullYear()}-${date.getMonth()}`;
    signatures.add(signature);
  });

  transactions.forEach((transaction) => {
    if (transaction.recurrence === 'monthly') {
      const startDate = new Date(transaction.createdAt);
      if (Number.isNaN(startDate.getTime())) {
        return;
      }
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
      while (currentDate <= projectionEndDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const signature = `${transaction.id}-${year}-${month}`;
        if (!signatures.has(signature)) {
          processed.push({
            ...transaction,
            id: `proj_${transaction.id}_${year}-${month}`,
            createdAt: new Date(currentDate).toISOString(),
            isProjection: true,
            paid: false,
            sourceOf: transaction.id,
          });
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
  });

  return processed;
};

const getInitialTransactions = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  // Migração: tentar usar novo serviço, fallback para localStorage antigo
  try {
    const stored = localStorage.getItem('smartfinance_transactions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

const getInitialGoals = () => {
  if (typeof window === 'undefined') {
    return { incomeGoal: '', expenseGoal: '' };
  }
  try {
    const stored = localStorage.getItem('smartfinance_goals');
    if (!stored) {
      return { incomeGoal: '', expenseGoal: '' };
    }
    const parsed = JSON.parse(stored);
    return {
      incomeGoal:
        parsed?.incomeGoal !== undefined && parsed?.incomeGoal !== null ? String(parsed.incomeGoal) : '',
      expenseGoal:
        parsed?.expenseGoal !== undefined && parsed?.expenseGoal !== null ? String(parsed.expenseGoal) : '',
    };
  } catch (error) {
    console.error('Erro ao carregar metas salvas:', error);
    return { incomeGoal: '', expenseGoal: '' };
  }
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const stored = localStorage.getItem('color-theme');
  if (stored) {
    return stored === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialEnvelopes = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('smartfinance_envelopes');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading envelopes:', error);
    return [];
  }
};

const getInitialCards = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('smartfinance_cards');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading cards:', error);
    return [];
  }
};

function AppContent() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState(getInitialTransactions);
  const [goals, setGoals] = useState(getInitialGoals);
  const [currentFilter, setCurrentFilter] = useState('total');
  const [currentPaymentFilter, setCurrentPaymentFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
  const [summaryOrder, setSummaryOrder] = useState(['income', 'expense', 'paid', 'balance']);

  // Estados premium
  const [envelopes, setEnvelopes] = useState(getInitialEnvelopes);
  const [cards, setCards] = useState(getInitialCards);

  const [editModalState, setEditModalState] = useState({ open: false, transaction: null });
  const [paymentModalState, setPaymentModalState] = useState({ open: false, transaction: null, projection: null });
  const [deleteChoiceState, setDeleteChoiceState] = useState({ open: false, transaction: null });
  const [editChoiceState, setEditChoiceState] = useState({ open: false, transaction: null });
  const [editAllValueState, setEditAllValueState] = useState({ open: false, groupId: null });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [activePage, setActivePage] = useState('overview');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className =
        'bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 min-h-screen px-3 sm:px-6 py-6 md:py-10 transition-colors duration-500';
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('color-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartfinance_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const payload = {
      incomeGoal: goals.incomeGoal === '' ? '' : Number(goals.incomeGoal),
      expenseGoal: goals.expenseGoal === '' ? '' : Number(goals.expenseGoal),
    };
    localStorage.setItem('smartfinance_goals', JSON.stringify(payload));
  }, [goals]);

  // Salvar envelopes e cards
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartfinance_envelopes', JSON.stringify(envelopes));
    }
  }, [envelopes]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartfinance_cards', JSON.stringify(cards));
    }
  }, [cards]);

  // Run notification checks on app load
  useEffect(() => {
    const prefs = loadNotificationPrefs();
    if (prefs.enabled) {
      runNotificationChecks({ prefs, transactions, envelopes, onUpdatePrefs: () => {}, t });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Import transactions from Open Finance
  const handleImportTransactions = (newTxs) => {
    setTransactions((prev) => [...prev, ...newTxs]);
  };

  const processedTransactions = useMemo(
    () => generateProcessedTransactions(transactions),
    [transactions],
  );

  const summaryTransactions = useMemo(() => {
    if (currentFilter === 'month') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      return processedTransactions.filter((transaction) => {
        const date = new Date(transaction.createdAt);
        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth
        );
      });
    }
    return processedTransactions;
  }, [processedTransactions, currentFilter]);

  const listTransactions = useMemo(() => {
    if (currentPaymentFilter === 'all') {
      return summaryTransactions;
    }
    return summaryTransactions.filter((transaction) => transaction.paymentMethod === currentPaymentFilter);
  }, [summaryTransactions, currentPaymentFilter]);

  const summaryValues = useMemo(() => {
    const income = summaryTransactions
      .filter((transaction) => transaction.type === 'income' && !transaction.isProjection)
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

    const totalExpenseRaw = summaryTransactions
      .filter((transaction) => transaction.type === 'expense' && !transaction.isProjection)
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

    const paidExpenseRaw = summaryTransactions
      .filter((transaction) => transaction.type === 'expense' && transaction.paid && !transaction.isProjection)
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

    return {
      income,
      totalExpense: Math.abs(totalExpenseRaw),
      paidExpense: Math.abs(paidExpenseRaw),
      balance: income + paidExpenseRaw,
    };
  }, [summaryTransactions]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleAddTransactions = (newTransactions) => {
    setTransactions((prev) => [...prev, ...newTransactions]);
  };

  const handleGoalChange = (field, rawValue) => {
    setGoals((prev) => {
      if (rawValue === '') {
        return { ...prev, [field]: '' };
      }
      const numeric = Number(rawValue);
      if (Number.isNaN(numeric) || numeric < 0) {
        return prev;
      }
      return { ...prev, [field]: rawValue };
    });
  };

  const handleTogglePaid = (transaction, isChecked) => {
    if (isChecked) {
      if (transaction.isProjection) {
        setPaymentModalState({ open: true, transaction: null, projection: transaction });
      } else {
        const original = transactions.find((item) => item.id === transaction.id);
        if (!original) {
          return;
        }
        setPaymentModalState({ open: true, transaction: original, projection: null });
      }
    } else if (!transaction.isProjection) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === transaction.id
            ? { ...item, paid: false, paymentMethod: null, creditCardName: null }
            : item,
        ),
      );
    }
  };

  const closePaymentModal = () => {
    setPaymentModalState({ open: false, transaction: null, projection: null });
  };

  const handlePaymentConfirm = ({ paymentMethod, creditCardName }) => {
    const normalizedCreditName = paymentMethod === 'credit' ? (creditCardName || null) : null;

    if (paymentModalState.projection) {
      const projection = paymentModalState.projection;
      const newTransaction = {
        id: Date.now().toString(),
        description: projection.description,
        amount: projection.amount,
        type: projection.type,
        createdAt: new Date(projection.createdAt).toISOString(),
        recurrence: 'single',
        paid: true,
        paymentMethod,
        creditCardName: normalizedCreditName,
        sourceOf: projection.sourceOf,
        groupId: projection.groupId,
      };
      setTransactions((prev) => [...prev, newTransaction]);
    } else if (paymentModalState.transaction) {
      const transactionId = paymentModalState.transaction.id;
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === transactionId
            ? { ...item, paid: true, paymentMethod, creditCardName: normalizedCreditName }
            : item,
        ),
      );
    }

    closePaymentModal();
  };

  const handleDeleteTransactionRequest = (transaction) => {
    if (transaction.isProjection) {
      return;
    }
    const original = transactions.find((item) => item.id === transaction.id);
    if (!original) {
      return;
    }
    if (original.recurrence === 'installment' && original.groupId) {
      setDeleteChoiceState({ open: true, transaction: original });
    } else {
      setTransactions((prev) => prev.filter((item) => item.id !== original.id));
    }
  };

  const handleDeleteSingle = () => {
    const target = deleteChoiceState.transaction;
    if (!target) {
      return;
    }
    setTransactions((prev) => prev.filter((item) => item.id !== target.id));
    setDeleteChoiceState({ open: false, transaction: null });
  };

  const handleDeleteAll = () => {
    const target = deleteChoiceState.transaction;
    if (!target) {
      return;
    }
    setTransactions((prev) => prev.filter((item) => item.groupId !== target.groupId));
    setDeleteChoiceState({ open: false, transaction: null });
  };

  const closeDeleteChoiceModal = () => {
    setDeleteChoiceState({ open: false, transaction: null });
  };

  const handleEditRequest = (transaction) => {
    if (transaction.isProjection) {
      return;
    }
    const original = transactions.find((item) => item.id === transaction.id);
    if (!original) {
      return;
    }
    if (original.recurrence === 'installment' && original.groupId) {
      setEditChoiceState({ open: true, transaction: original });
    } else {
      setEditModalState({ open: true, transaction: original });
    }
  };

  const handleEditSingle = () => {
    const target = editChoiceState.transaction;
    if (!target) {
      return;
    }
    const original = transactions.find((item) => item.id === target.id);
    if (!original) {
      setEditChoiceState({ open: false, transaction: null });
      return;
    }
    setEditModalState({ open: true, transaction: original });
    setEditChoiceState({ open: false, transaction: null });
  };

  const handleEditAll = () => {
    const target = editChoiceState.transaction;
    if (!target) {
      return;
    }
    setEditAllValueState({ open: true, groupId: target.groupId });
    setEditChoiceState({ open: false, transaction: null });
  };

  const closeEditChoiceModal = () => {
    setEditChoiceState({ open: false, transaction: null });
  };

  const handleEditSubmit = ({ id, description, amount, type, date, recurrence }) => {
    setTransactions((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }
        const signedAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
        let updatedDescription = description;
        if (
          item.recurrence === 'installment' &&
          !/\s\(\d+\/\d+\)$/u.test(description)
        ) {
          const match = item.description.match(/\s(\(\d+\/\d+\))$/u);
          if (match) {
            updatedDescription = `${description} ${match[1]}`;
          }
        }
        return {
          ...item,
          description: updatedDescription,
          amount: signedAmount,
          type,
          createdAt: new Date(`${date}T12:00:00`).toISOString(),
          recurrence,
        };
      }),
    );
    setEditModalState({ open: false, transaction: null });
  };

  const handleEditAllSubmit = (newValue) => {
    if (!editAllValueState.groupId) {
      return;
    }
    const negativeValue = -Math.abs(newValue);
    setTransactions((prev) =>
      prev.map((item) =>
        item.groupId === editAllValueState.groupId && !item.paid
          ? { ...item, amount: negativeValue }
          : item,
      ),
    );
    setEditAllValueState({ open: false, groupId: null });
  };

  const closeEditAllModal = () => {
    setEditAllValueState({ open: false, groupId: null });
  };

  const handleClearAllRequest = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    setTransactions([]);
    setConfirmDeleteOpen(false);
  };

  const handleCancelDeleteAll = () => {
    setConfirmDeleteOpen(false);
  };

  const panelClasses =
    'glass-panel mesh-gradient rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/30';

  return (
    <>
      <main className="w-full max-w-md mx-auto px-3 sm:px-0 space-y-5 sm:space-y-6 md:space-y-8 pb-28">
        {/* PÁGINA: VISÃO GERAL */}
        <section
          id="page-overview"
          data-page="overview"
          className={`page-section space-y-5 ${activePage === 'overview' ? '' : 'hidden'}`}
        >
          <Header logoSrc={logoBlue} />
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{t('page.overview.overline')}</p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('page.overview.title')}</h2>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">{t('page.overview.drag')}</p>
            <SummaryCards
              totalIncome={summaryValues.income}
              totalExpense={summaryValues.totalExpense}
              totalPaid={summaryValues.paidExpense}
              balance={summaryValues.balance}
              formatCurrency={formatCurrency}
              cardOrder={summaryOrder}
              onReorder={setSummaryOrder}
            />
          </div>

          {/* Insights Automáticos */}
          <InsightsSection transactions={summaryTransactions} envelopes={envelopes} />

          {/* Próximos Lançamentos */}
          <UpcomingBillsSection transactions={processedTransactions} />
        </section>

        {/* PÁGINA: GRÁFICOS E METAS */}
        <section
          id="page-graphs-goals"
          data-page="graphs-goals"
          className={`page-section space-y-5 ${activePage === 'graphs-goals' ? '' : 'hidden'}`}
        >
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <ChartSection transactions={summaryTransactions} isDarkMode={isDarkMode} />
          </div>

          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <GoalsSection
              goals={goals}
              onGoalChange={handleGoalChange}
              summaryValues={summaryValues}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Envelopes de Gastos */}
          <EnvelopesSection
            transactions={summaryTransactions}
            envelopes={envelopes}
            onSaveEnvelopes={setEnvelopes}
          />

          {/* Análises Avançadas */}
          <AdvancedAnalytics transactions={summaryTransactions} />
        </section>

        {/* PÁGINA: HISTÓRICO */}
        <section
          id="page-history"
          data-page="history"
          className={`page-section space-y-5 ${activePage === 'history' ? '' : 'hidden'}`}
        >
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{t('page.history.overline')}</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('page.history.title')}</h3>
              </div>
            </div>
            <FilterBar currentFilter={currentFilter} onChange={setCurrentFilter} />
            <div className="border-b border-slate-100 dark:border-slate-700/50" />
            <PaymentTabs currentPaymentFilter={currentPaymentFilter} onChange={setCurrentPaymentFilter} />
            <TransactionList
              transactions={listTransactions}
              onTogglePaid={handleTogglePaid}
              onEdit={handleEditRequest}
              onDelete={handleDeleteTransactionRequest}
              formatCurrency={(value) => formatCurrency(value)}
            />
          </div>

          {/* Cartões de Crédito */}
          <CreditCardsSection
            transactions={transactions}
            cards={cards}
            onSaveCards={setCards}
          />

          {/* Export e Backup */}
          <ExportSection />
        </section>

        {/* PÁGINA: NOVA TRANSAÇÃO */}
        <section
          id="page-new-transaction"
          data-page="new-transaction"
          className={`page-section space-y-5 ${activePage === 'new-transaction' ? '' : 'hidden'}`}
        >
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{t('page.new.overline')}</p>
            <TransactionForm onAddTransactions={handleAddTransactions} onClearAll={handleClearAllRequest} />
          </div>
        </section>

        {/* PÁGINA: CONFIGURAÇÕES */}
        <section
          id="page-settings"
          data-page="settings"
          className={`page-section space-y-5 ${activePage === 'settings' ? '' : 'hidden'}`}
        >
          <SettingsSection
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            transactions={transactions}
            onClearAll={handleClearAllRequest}
            onImportTransactions={handleImportTransactions}
          />
        </section>
      </main>

      {/* NAVEGAÇÃO INFERIOR */}
      <nav id="bottom-nav" className="fixed bottom-0 inset-x-0 z-30">
        <div className="mx-auto max-w-md relative">
          {/* FAB — botão Nova flutuante */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-10">
            <button
              type="button"
              aria-label="Nova transação"
              onClick={() => setActivePage('new-transaction')}
              className={`fab-button flex items-center justify-center w-14 h-14 rounded-full focus:outline-none ${
                activePage === 'new-transaction' ? 'fab-active ring-4 ring-sky-400/20' : 'fab-pulse'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
            </button>
          </div>

          {/* Tab bar */}
          <div className="nav-glass flex items-center justify-around px-1 pt-1 pb-2">
            <NavTab target="overview" label={t('nav.home')} activePage={activePage} onNavigate={setActivePage}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </NavTab>
            <NavTab target="graphs-goals" label={t('nav.chart')} activePage={activePage} onNavigate={setActivePage}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3v18M6 8v13M16 13v8" />
            </NavTab>
            {/* Espaço central para o FAB */}
            <div className="w-14 flex-shrink-0" aria-hidden="true" />
            <NavTab target="history" label={t('nav.history')} activePage={activePage} onNavigate={setActivePage}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </NavTab>
            <NavTab target="settings" label={t('nav.config')} activePage={activePage} onNavigate={setActivePage}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </NavTab>
          </div>
        </div>
      </nav>

      {/* MODAIS */}
      <EditTransactionModal
        isOpen={editModalState.open}
        transaction={editModalState.transaction}
        onClose={() => setEditModalState({ open: false, transaction: null })}
        onSubmit={handleEditSubmit}
      />

      <PaymentModal
        isOpen={paymentModalState.open}
        onClose={closePaymentModal}
        onConfirm={handlePaymentConfirm}
      />

      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        onCancel={handleCancelDeleteAll}
        onConfirm={handleConfirmDeleteAll}
      />

      <DeleteChoiceModal
        isOpen={deleteChoiceState.open}
        onClose={closeDeleteChoiceModal}
        onDeleteSingle={handleDeleteSingle}
        onDeleteAll={handleDeleteAll}
      />

      <EditChoiceModal
        isOpen={editChoiceState.open}
        onClose={closeEditChoiceModal}
        onEditSingle={handleEditSingle}
        onEditAll={handleEditAll}
      />

      <EditAllValueModal
        isOpen={editAllValueState.open}
        onClose={closeEditAllModal}
        onSubmit={handleEditAllSubmit}
      />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
