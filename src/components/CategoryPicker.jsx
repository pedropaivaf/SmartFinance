import React, { useMemo, useState } from 'react';
import CATEGORIES, { getCategoriesByGroup, CUSTOM_COLORS } from '../data/categories';
import { useTranslation } from '../i18n/index.jsx';

/** Tailwind dot colors — bg classes for the small circle indicator */
const dotBg = {
  slate: 'bg-slate-400 dark:bg-slate-500',
  red: 'bg-red-500 dark:bg-red-400',
  orange: 'bg-orange-500 dark:bg-orange-400',
  amber: 'bg-amber-500 dark:bg-amber-400',
  lime: 'bg-lime-500 dark:bg-lime-400',
  green: 'bg-green-500 dark:bg-green-400',
  emerald: 'bg-emerald-500 dark:bg-emerald-400',
  teal: 'bg-teal-500 dark:bg-teal-400',
  cyan: 'bg-cyan-500 dark:bg-cyan-400',
  sky: 'bg-sky-500 dark:bg-sky-400',
  blue: 'bg-blue-500 dark:bg-blue-400',
  indigo: 'bg-indigo-500 dark:bg-indigo-400',
  violet: 'bg-violet-500 dark:bg-violet-400',
  purple: 'bg-purple-500 dark:bg-purple-400',
  fuchsia: 'bg-fuchsia-500 dark:bg-fuchsia-400',
  pink: 'bg-pink-500 dark:bg-pink-400',
  rose: 'bg-rose-500 dark:bg-rose-400',
};

/** Selected tag ring colors */
const ringColor = {
  slate: 'ring-slate-400', red: 'ring-red-400', orange: 'ring-orange-400',
  amber: 'ring-amber-400', lime: 'ring-lime-400', green: 'ring-green-400',
  emerald: 'ring-emerald-400', teal: 'ring-teal-400', cyan: 'ring-cyan-400',
  sky: 'ring-sky-400', blue: 'ring-blue-400', indigo: 'ring-indigo-400',
  violet: 'ring-violet-400', purple: 'ring-purple-400', fuchsia: 'ring-fuchsia-400',
  pink: 'ring-pink-400', rose: 'ring-rose-400',
};

function CategoryTag({ cat, label, isSelected, onClick }) {
  const dot = dotBg[cat.color] || dotBg.slate;
  const ring = ringColor[cat.color] || ringColor.slate;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-150 min-h-[36px] ${
        isSelected
          ? `ring-2 ${ring} bg-white dark:bg-[#2D2B28] text-[#1A1A1A] dark:text-[#E8E4DF] shadow-sm`
          : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28] active:scale-95'
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function CategoryPicker({ isOpen, selected, onSelect, onClose, transactionType, customCategories = [], onAddCustomCategory }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('blue');

  const groupOrder = transactionType === 'income'
    ? ['income', 'other', 'custom']
    : ['essentials', 'transport', 'lifestyle', 'education', 'other', 'custom'];

  const filteredGroups = useMemo(() => {
    const grouped = getCategoriesByGroup(customCategories);
    const query = search.toLowerCase().trim();
    const result = [];

    for (const groupKey of groupOrder) {
      const cats = grouped.get(groupKey);
      if (!cats) continue;
      const filtered = query
        ? cats.filter((c) => {
            const name = t(`categories.${c.id}`) || c.id;
            return name.toLowerCase().includes(query);
          })
        : cats;
      if (filtered.length > 0) {
        result.push({ group: groupKey, items: filtered });
      }
    }

    // Include groups not in the ordered list
    if (query) {
      for (const [groupKey, cats] of grouped) {
        if (groupOrder.includes(groupKey)) continue;
        const filtered = cats.filter((c) => {
          const name = t(`categories.${c.id}`) || c.id;
          return name.toLowerCase().includes(query);
        });
        if (filtered.length > 0) {
          result.push({ group: groupKey, items: filtered });
        }
      }
    }

    return result;
  }, [search, transactionType, customCategories, groupOrder, t]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowCreate(false);
      setSearch('');
      onClose();
    }
  };

  const handleSelect = (id) => {
    onSelect(id);
    setSearch('');
    setShowCreate(false);
    onClose();
  };

  const handleCreateCategory = () => {
    const name = newName.trim();
    if (!name) return;
    const id = `custom_${name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
    if (onAddCustomCategory) {
      onAddCustomCategory({ id, color: newColor, group: 'custom', label: name });
    }
    setNewName('');
    setNewColor('blue');
    setShowCreate(false);
    onSelect(id);
    onClose();
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-[#1A1A1A]/50 dark:bg-[#111110]/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-md bg-white dark:bg-[#1E1D1C] rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h3 className="text-base font-semibold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
            {t('categories.picker.title')}
          </h3>
          <button
            type="button"
            onClick={() => { setShowCreate(false); setSearch(''); onClose(); }}
            className="p-2 -mr-2 rounded-full hover:bg-[#F4F3EF] dark:hover:bg-[#2D2B28] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9B9B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('categories.picker.search')}
            className="w-full text-sm px-4 py-2.5 rounded-xl bg-[#F4F3EF] dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] placeholder:text-[#9B9B9B] dark:placeholder:text-[#6B6560] focus:outline-none focus:ring-2 focus:ring-[#1B4965] transition"
          />
        </div>

        {/* Tags */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
          {filteredGroups.map(({ group, items }) => (
            <div key={group}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9B9B9B] dark:text-[#6B6560] mb-2">
                {t(`categories.group.${group}`)}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((cat) => (
                  <CategoryTag
                    key={cat.id}
                    cat={cat}
                    label={cat.label || t(`categories.${cat.id}`)}
                    isSelected={selected === cat.id}
                    onClick={() => handleSelect(cat.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && !showCreate && (
            <p className="text-center text-[#9B9B9B] dark:text-[#6B6560] py-6 text-sm">
              {t('categories.picker.empty')}
            </p>
          )}
        </div>

        {/* Create custom category */}
        <div className="border-t border-[#E8E5E0] dark:border-[#2D2B28] px-5 py-3">
          {!showCreate ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#1B4965] dark:text-[#5FA8D3] hover:bg-[#E8F0F4] dark:hover:bg-[#1B2B35] rounded-xl transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t('categories.picker.create')}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('categories.picker.newName')}
                  className="flex-1 text-sm px-3 py-2.5 rounded-xl bg-[#F4F3EF] dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#1B4965] transition"
                  maxLength={30}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!newName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#1B4965] text-white text-sm font-medium hover:bg-[#153B52] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {t('categories.picker.add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CUSTOM_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${dotBg[c]} ${
                      newColor === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1E1D1C] ring-[#9B9B9B] scale-110' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { dotBg };
export default CategoryPicker;
