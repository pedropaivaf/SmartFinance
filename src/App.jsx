import React, { useEffect, useMemo, useState } from 'react';
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

const logoBlue = '/LogoSFblue.png';

const STORAGE_KEY = 'smartfinance_transactions';
const GOALS_KEY = 'smartfinance_goals';

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
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getInitialGoals = () => {
  if (typeof window === 'undefined') {
    return { incomeGoal: '', expenseGoal: '' };
  }
  try {
    const stored = localStorage.getItem(GOALS_KEY);
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

function App() {
  const [transactions, setTransactions] = useState(getInitialTransactions);
  const [goals, setGoals] = useState(getInitialGoals);
  const [currentFilter, setCurrentFilter] = useState('total');
  const [currentPaymentFilter, setCurrentPaymentFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
  const [summaryOrder, setSummaryOrder] = useState(['income', 'expense', 'paid', 'balance']);

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
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
    localStorage.setItem(GOALS_KEY, JSON.stringify(payload));
  }, [goals]);

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
    'bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/30 backdrop-blur-sm';

  return (
    <>
      <main className="w-full max-w-md mx-auto px-3 sm:px-0 space-y-5 sm:space-y-6 md:space-y-8 pb-24">
        <section
          id="page-overview"
          data-page="overview"
          className={`page-section space-y-5 ${activePage === 'overview' ? '' : 'hidden'}`}
        >
          <Header
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            logoSrc={logoBlue}
          />
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Visão geral</p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Suas métricas organizadas para facil visualização.</h2>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Segure e arraste os cards para alterar a ordem.</p>
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
        </section>

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
        </section>

        <section
          id="page-history"
          data-page="history"
          className={`page-section space-y-5 ${activePage === 'history' ? '' : 'hidden'}`}
        >
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Histórico</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transações por período</h3>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-4">
              <FilterBar currentFilter={currentFilter} onChange={setCurrentFilter} />
            </div>
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-4">
              <PaymentTabs currentPaymentFilter={currentPaymentFilter} onChange={setCurrentPaymentFilter} />
            </div>
            <TransactionList
              transactions={listTransactions}
              onTogglePaid={handleTogglePaid}
              onEdit={handleEditRequest}
              onDelete={handleDeleteTransactionRequest}
              formatCurrency={(value) => formatCurrency(value)}
            />
          </div>
        </section>

        <section
          id="page-new-transaction"
          data-page="new-transaction"
          className={`page-section space-y-5 ${activePage === 'new-transaction' ? '' : 'hidden'}`}
        >
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Ação principal</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nova transação</h3>
              </div>
            </div>
            <TransactionForm onAddTransactions={handleAddTransactions} onClearAll={handleClearAllRequest} />
          </div>
        </section>
      </main>

      <nav id="bottom-nav" className="fixed bottom-0 inset-x-0 z-30">
        <div className="mx-auto max-w-md bg-slate-900/90 dark:bg-slate-900/90 border-t border-white/10 backdrop-blur px-2 py-1 flex justify-between gap-1">
          {[
            { target: 'overview', label: 'Inicio', icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l8-8 8 8v6a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
            ) },
            { target: 'graphs-goals', label: 'Gráfico/Metas', icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3v18M6 8v13M16 13v8" />
            ) },
            { target: 'history', label: 'Histórico', icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) },
            { target: 'new-transaction', label: 'Nova', icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
            ) },
          ].map(({ target, label, icon }) => {
            const isActive = activePage === target;
            return (
              <button
                key={target}
                type="button"
                className={`nav-tab flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-xs transition ${
                  isActive ? 'text-sky-400' : 'text-slate-400'
                }`}
                data-target={target}
                onClick={() => setActivePage(target)}
              >
                <span
                  className={`h-8 w-8 rounded-full border flex items-center justify-center ${
                    isActive ? 'border-sky-500/60 bg-sky-500/20' : 'border-slate-600 bg-slate-800/60'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {icon}
                  </svg>
                </span>
                <span className={isActive ? 'font-semibold' : ''}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

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

export default App;
