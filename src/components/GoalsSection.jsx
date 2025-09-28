import React from 'react';

const parseGoal = (value) => {
  const numeric = parseFloat(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
};

function GoalsSection({ goals, onGoalChange, summaryValues, formatCurrency }) {
  const incomeGoalValue = parseGoal(goals.incomeGoal);
  const expenseGoalValue = parseGoal(goals.expenseGoal);

  const incomeAchieved = summaryValues.income;
  const expenseTotal = summaryValues.totalExpense;

  const incomeProgress = incomeGoalValue ? Math.min(100, (incomeAchieved / incomeGoalValue) * 100) : 0;
  const expenseProgress = expenseGoalValue ? Math.min(100, (expenseTotal / expenseGoalValue) * 100) : 0;

  const incomeDifference = incomeGoalValue - incomeAchieved;
  const expenseDifference = expenseGoalValue - expenseTotal;

  const handleChange = (field) => (event) => {
    onGoalChange(field, event.target.value);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Metas de orçamento</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Defina objetivos mensais para renda e gastos. O painel abaixo mostra o quanto já foi atingido.
        </p>
      </div>
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Definição de metas">
        <label className="flex flex-col gap-2 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Meta de renda mensal</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={goals.incomeGoal}
            onChange={handleChange('incomeGoal')}
            placeholder="Ex.: 5000"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Use este valor para visualizar se a renda do período está dentro do esperado.
          </span>
        </label>
        <label className="flex flex-col gap-2 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Meta de gastos mensais</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={goals.expenseGoal}
            onChange={handleChange('expenseGoal')}
            placeholder="Ex.: 3000"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Compare o quanto já foi gasto com o limite que você deseja respeitar no mês.
          </span>
        </label>
      </form>

      <div className="space-y-4" aria-live="polite">
        <GoalProgress
          title="Progresso da renda"
          current={incomeAchieved}
          goal={incomeGoalValue}
          difference={incomeDifference}
          progress={incomeProgress}
          formatCurrency={formatCurrency}
          positiveIsGood
        />
        <GoalProgress
          title="Progresso dos gastos"
          current={expenseTotal}
          goal={expenseGoalValue}
          difference={expenseDifference}
          progress={expenseProgress}
          formatCurrency={formatCurrency}
        />
      </div>
    </section>
  );
}

function GoalProgress({ title, current, goal, difference, progress, formatCurrency, positiveIsGood = false }) {
  const hasGoal = goal > 0;
  const remaining = hasGoal ? goal - current : 0;
  const exceeded = hasGoal && ((!positiveIsGood && current > goal) || (positiveIsGood && current < goal));

  const statusMessage = (() => {
    if (!hasGoal) {
      return 'Defina uma meta para acompanhar sua evolução.';
    }
    if (positiveIsGood) {
      if (current >= goal) {
        return 'Meta alcançada! Parabéns pelo resultado.';
      }
      return `Faltam ${formatCurrency(remaining)} para atingir a meta.`;
    }
    if (current <= goal) {
      return `Ainda restam ${formatCurrency(Math.max(0, remaining))} dentro do limite planejado.`;
    }
    return 'Atenção: você ultrapassou o limite definido.';
  })();

  const progressWidth = hasGoal ? `${progress}%` : '0%';
  const ratio = hasGoal && goal !== 0 ? current / goal : 0;
  const statusClass = (() => {
    if (!hasGoal) {
      return 'text-slate-500 dark:text-slate-400';
    }

    if (positiveIsGood) {
      return ratio >= 1 ? 'text-sky-400 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400';
    }

    if (exceeded) {
      return 'text-red-600 dark:text-red-400';
    }

    return 'text-slate-500 dark:text-slate-400';
  })();

  const barColor = (() => {
    if (!hasGoal) {
      return 'bg-slate-300';
    }

    if (positiveIsGood) {
      return ratio >= 1 ? 'bg-sky-400' : 'bg-blue-800';
    }

    if (ratio <= 0.6) {
      return 'bg-emerald-500';
    }
    if (ratio <= 0.9) {
      return 'bg-amber-400';
    }
    if (ratio <= 1) {
      return 'bg-orange-500';
    }
    return 'bg-rose-500';
  })();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{title}</span>
        {goal > 0 && (
          <span className="text-slate-500 dark:text-slate-400">
            {formatCurrency(current)} / {formatCurrency(goal)}
          </span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: progressWidth }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        />
      </div>
      <p className={`text-xs ${statusClass}`}>
        {statusMessage}
      </p>
    </div>
  );
}

export default GoalsSection;
