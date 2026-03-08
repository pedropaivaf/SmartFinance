/**
 * Predefined transaction categories — minimalist tag style.
 * Each category has a Tailwind color key for the dot/badge.
 * Custom categories are stored per-user and merged at runtime.
 */

const CATEGORIES = [
  // Essentials
  { id: 'housing', color: 'violet', group: 'essentials' },
  { id: 'groceries', color: 'green', group: 'essentials' },
  { id: 'utilities', color: 'amber', group: 'essentials' },
  { id: 'internet', color: 'cyan', group: 'essentials' },
  { id: 'health', color: 'rose', group: 'essentials' },
  { id: 'insurance', color: 'indigo', group: 'essentials' },

  // Transport
  { id: 'transport', color: 'blue', group: 'transport' },
  { id: 'fuel', color: 'orange', group: 'transport' },
  { id: 'rideshare', color: 'slate', group: 'transport' },

  // Lifestyle
  { id: 'food_out', color: 'red', group: 'lifestyle' },
  { id: 'entertainment', color: 'purple', group: 'lifestyle' },
  { id: 'shopping', color: 'pink', group: 'lifestyle' },
  { id: 'clothing', color: 'fuchsia', group: 'lifestyle' },
  { id: 'subscriptions', color: 'teal', group: 'lifestyle' },
  { id: 'travel', color: 'sky', group: 'lifestyle' },
  { id: 'pets', color: 'lime', group: 'lifestyle' },
  { id: 'gifts', color: 'rose', group: 'lifestyle' },

  // Education
  { id: 'education', color: 'blue', group: 'education' },
  { id: 'books', color: 'emerald', group: 'education' },

  // Income
  { id: 'salary', color: 'emerald', group: 'income' },
  { id: 'freelance', color: 'sky', group: 'income' },
  { id: 'investments', color: 'green', group: 'income' },
  { id: 'bonus', color: 'amber', group: 'income' },

  // Other
  { id: 'other', color: 'slate', group: 'other' },
];

// Available colors for custom categories
export const CUSTOM_COLORS = [
  'red', 'orange', 'amber', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose', 'slate',
];

/**
 * Get a category by id — checks predefined first, then custom list.
 * @param {string} id
 * @param {Array} customCategories - user's custom categories [{id, color, group}]
 */
export function getCategoryById(id, customCategories = []) {
  return CATEGORIES.find((c) => c.id === id)
    || customCategories.find((c) => c.id === id)
    || null;
}

/**
 * Get all categories grouped, merging predefined + custom.
 */
export function getCategoriesByGroup(customCategories = []) {
  const all = [...CATEGORIES, ...customCategories];
  const groups = new Map();
  for (const cat of all) {
    const g = cat.group || 'custom';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(cat);
  }
  return groups;
}

export function getCategoryColor(id, customCategories = []) {
  const cat = getCategoryById(id, customCategories);
  return cat ? cat.color : 'slate';
}

export default CATEGORIES;
