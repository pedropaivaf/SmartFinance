/**
 * ExportSection Component
 *
 * Export e backup de dados
 * Feature Premium
 */

import React, { useState } from 'react';
import PremiumBadge from './PremiumBadge';
import PremiumCard from './PremiumCard';
import { hasFeature } from '../config';
import { exportAllData } from '../services/storageService';

export default function ExportSection() {
  const [isExporting, setIsExporting] = useState(false);
  const isPremium = hasFeature('export_data');

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const data = await exportAllData();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartfinance-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Erro ao exportar dados.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const data = await exportAllData();

      // Converter transactions para CSV
      const headers = ['Data', 'Descrição', 'Tipo', 'Valor', 'Pago', 'Método', 'Categoria', 'Recorrência'];
      const rows = data.transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString('pt-BR'),
        t.description,
        t.type === 'income' ? 'Renda' : 'Despesa',
        Math.abs(t.amount).toFixed(2),
        t.paid ? 'Sim' : 'Não',
        t.paymentMethod || '-',
        t.category || '-',
        t.recurrence || 'single',
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartfinance-transacoes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Transações exportadas para CSV com sucesso!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erro ao exportar CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isPremium) {
    return (
      <PremiumCard
        title="Exportar Dados"
        description="Faça backup completo dos seus dados em JSON ou exporte suas transações para CSV/Excel."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-slate-200/80 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Exportar & Backup
        </h2>
        <PremiumBadge size="xs" />
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Mantenha seus dados seguros exportando backups regulares ou exporte para planilhas.
      </p>

      <div className="space-y-3">
        <button
          onClick={handleExportJSON}
          disabled={isExporting}
          className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Backup Completo (JSON)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Todos os dados: transações, metas, cartões, envelopes
              </p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Exportar Transações (CSV)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apenas transações para usar em Excel/Planilhas
              </p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Dica:</strong> Faça backups regulares para não perder seus dados. Recomendamos exportar mensalmente.
        </p>
      </div>
    </div>
  );
}
