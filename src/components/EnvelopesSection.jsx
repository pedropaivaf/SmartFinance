/**
 * EnvelopesSection Component
 *
 * Gerenciamento de envelopes por categoria (controle de gastos)
 * Feature Premium
 */

import React, { useState, useMemo } from 'react';
import PremiumBadge from './PremiumBadge';
import PremiumCard from './PremiumCard';
import { hasFeature } from '../config';
import { calculateEnvelopeStatus } from '../utils/calculations';

export default function EnvelopesSection({ transactions, envelopes, onSaveEnvelopes }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEnvelope, setNewEnvelope] = useState({
    name: '',
    category: '',
    monthlyLimit: '',
  });

  const isPremium = hasFeature('envelopes');

  // Calcula status de cada envelope
  const envelopesWithStatus = useMemo(() => {
    return envelopes.map(env => {
      const status = calculateEnvelopeStatus(transactions, env);
      return { ...env, ...status };
    });
  }, [envelopes, transactions]);

  const handleAddEnvelope = () => {
    if (!newEnvelope.name || !newEnvelope.monthlyLimit) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const envelope = {
      id: Date.now().toString(),
      name: newEnvelope.name,
      category: newEnvelope.category || newEnvelope.name,
      monthlyLimit: parseFloat(newEnvelope.monthlyLimit),
    };

    onSaveEnvelopes([...envelopes, envelope]);
    setNewEnvelope({ name: '', category: '', monthlyLimit: '' });
    setIsAdding(false);
  };

  const handleDeleteEnvelope = (id) => {
    if (confirm('Deseja realmente excluir este envelope?')) {
      onSaveEnvelopes(envelopes.filter(e => e.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return 'bg-[#2D6A4F] dark:bg-[#52B788]';
      case 'warning':
        return 'bg-amber-500';
      case 'critical':
        return 'bg-orange-500';
      case 'exceeded':
        return 'bg-[#9B2226] dark:bg-[#E76F51]';
      default:
        return 'bg-[#D4D0C8]';
    }
  };

  const getStatusMessage = (env) => {
    if (env.status === 'exceeded') {
      return `Limite ultrapassado em R$ ${(env.spent - env.monthlyLimit).toFixed(2)}`;
    }
    if (env.status === 'critical') {
      return `Faltam apenas R$ ${env.remaining.toFixed(2)}`;
    }
    if (env.status === 'warning') {
      return `Atenção ao limite!`;
    }
    return `Restam R$ ${env.remaining.toFixed(2)}`;
  };

  if (!isPremium) {
    return (
      <PremiumCard
        title="Envelopes de Gastos"
        description="Crie envelopes por categoria e controle seus gastos mensais. Receba alertas quando estiver perto do limite."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-sm border border-[#E8E5E0] dark:border-[#2D2B28] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
            Envelopes de Gastos
          </h2>
          <PremiumBadge size="xs" />
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#1B4965] hover:bg-[#153B52] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          {isAdding ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-[#F4F3EF] dark:bg-[#111110] rounded-xl border border-[#E8E5E0] dark:border-[#2D2B28]">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A09A92] mb-1">
                Nome do Envelope
              </label>
              <input
                type="text"
                value={newEnvelope.name}
                onChange={(e) => setNewEnvelope({ ...newEnvelope, name: e.target.value })}
                placeholder="Ex: Mercado, Lazer, Transporte"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A09A92] mb-1">
                Limite Mensal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={newEnvelope.monthlyLimit}
                onChange={(e) => setNewEnvelope({ ...newEnvelope, monthlyLimit: e.target.value })}
                placeholder="500.00"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>
            <button
              onClick={handleAddEnvelope}
              className="w-full bg-[#2D6A4F] hover:bg-[#245A42] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Criar Envelope
            </button>
          </div>
        </div>
      )}

      {envelopesWithStatus.length === 0 ? (
        <p className="text-center text-[#6B6B6B] dark:text-[#A09A92] py-8 text-sm">
          Nenhum envelope criado ainda. Clique em "+ Novo" para começar.
        </p>
      ) : (
        <div className="space-y-4">
          {envelopesWithStatus.map((env) => (
            <div
              key={env.id}
              className="p-4 bg-[#F4F3EF] dark:bg-[#111110] rounded-xl border border-[#E8E5E0] dark:border-[#2D2B28]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
                  {env.name}
                </h3>
                <button
                  onClick={() => handleDeleteEnvelope(env.id)}
                  className="text-[#9B2226] hover:text-[#7A1B1E] dark:text-[#E76F51] dark:hover:text-[#D4603F] text-sm"
                >
                  Excluir
                </button>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#6B6B6B] dark:text-[#A09A92]">
                    R$ {env.spent.toFixed(2)} de R$ {env.monthlyLimit.toFixed(2)}
                  </span>
                  <span className="font-medium text-[#1A1A1A] dark:text-[#E8E4DF]">
                    {env.percent.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-[#E8E5E0] dark:bg-[#2D2B28] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(env.status)} transition-all duration-300`}
                    style={{ width: `${Math.min(env.percent, 100)}%` }}
                  />
                </div>
              </div>

              <p className={`text-xs font-medium ${
                env.status === 'exceeded' || env.status === 'critical'
                  ? 'text-[#9B2226] dark:text-[#E76F51]'
                  : env.status === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-[#2D6A4F] dark:text-[#52B788]'
              }`}>
                {getStatusMessage(env)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
