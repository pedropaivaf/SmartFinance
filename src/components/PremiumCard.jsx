/**
 * PremiumCard Component
 *
 * Card que mostra recurso premium bloqueado
 */

import React from 'react';
import PremiumBadge from './PremiumBadge';
import { getPremiumMessage } from '../config';

export default function PremiumCard({ title, description, icon, onClick }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 transition-all hover:shadow-lg">
      <div className="absolute top-3 right-3">
        <PremiumBadge size="sm" />
      </div>

      {icon && (
        <div className="mb-3 text-amber-500 dark:text-amber-400">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        {description}
      </p>

      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-3">
        {getPremiumMessage()}
      </p>

      {onClick && (
        <button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Ativar Premium
        </button>
      )}
    </div>
  );
}
