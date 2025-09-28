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

  const [editModalState, setEditModalState] = useState({ open: false, transaction: null });
  const [paymentModalState, setPaymentModalState] = useState({ open: false, transaction: null, projection: null });
  const [deleteChoiceState, setDeleteChoiceState] = useState({ open: false, transaction: null });
  const [editChoiceState, setEditChoiceState] = useState({ open: false, transaction: null });
  const [editAllValueState, setEditAllValueState] = useState({ open: false, groupId: null });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className =
        'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen px-3 sm:px-6 py-6 md:py-10 transition-colors duration-300';
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

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleAddTransactions = (newTransactions) => {
    closeMenu();
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

  const asideClasses = `transform transition-transform duration-300 ease-out fixed inset-y-0 left-0 z-30 w-full max-w-xs overflow-y-auto bg-slate-50 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-700 shadow-xl px-5 sm:px-6 py-6 space-y-6 md:static md:z-auto md:w-auto md:max-w-none md:overflow-visible md:bg-slate-50 md:dark:bg-slate-800/50 md:border-0 md:border-r md:dark:border-slate-700 md:shadow-none md:px-6 md:py-8 md:transform-none md:transition-none md:space-y-6 md:rounded-2xl md:col-span-2 lg:col-span-2 ${
    isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  }`;

  return (
    <>
      <header className="w-full max-w-6xl mx-auto px-3 sm:px-0 mb-4 md:mb-6">
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          logoSrc={logoBlue}
          onToggleMenu={handleToggleMenu}
          isMenuOpen={isMenuOpen}
        />
      </header>

      {isMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Fechar painel de navegação"
        />
      )}

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-5">
        <aside className={asideClasses}>
          <GoalsSection
            goals={goals}
            onGoalChange={handleGoalChange}
            summaryValues={summaryValues}
            formatCurrency={formatCurrency}
          />
          <SummaryCards
            totalIncome={summaryValues.income}
            totalExpense={summaryValues.totalExpense}
            totalPaid={summaryValues.paidExpense}
            balance={summaryValues.balance}
            formatCurrency={formatCurrency}
          />
          <TransactionForm onAddTransactions={handleAddTransactions} onClearAll={handleClearAllRequest} />
        </aside>

        <main className="col-span-1 md:col-span-3 lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg md:shadow-none p-5 sm:p-6 md:p-8 flex flex-col gap-6">
          <ChartSection transactions={summaryTransactions} isDarkMode={isDarkMode} />
          <FilterBar currentFilter={currentFilter} onChange={setCurrentFilter} />
          <PaymentTabs currentPaymentFilter={currentPaymentFilter} onChange={setCurrentPaymentFilter} />
          <TransactionList
            transactions={listTransactions}
            onTogglePaid={handleTogglePaid}
            onEdit={handleEditRequest}
            onDelete={handleDeleteTransactionRequest}
            formatCurrency={(value) => formatCurrency(value)}
          />
        </main>
      </div>

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