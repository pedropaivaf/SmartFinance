# SmartFinance — User Workflows

## 1. Add Single Transaction

1. Tap the **FAB (+)** button in the center of the bottom nav
2. Select type: **Renda** (income) or **Despesa** (expense)
3. Enter description and amount
4. Select category
5. Set recurrence to **Única**
6. Tap **Adicionar**
7. Transaction appears in the current month on the History page

## 2. Add Recurring (Monthly) Transaction

1. Tap the **FAB (+)** button
2. Select type and fill in details
3. Set recurrence to **Mensal**
4. Tap **Adicionar**
5. Base transaction created + auto-projections generated for 12 months ahead
6. Each month's projection appears in history as semi-transparent (`.transaction-projection`)
7. When due, mark as paid → projection is replaced with a real persisted transaction

## 3. Add Installment Transaction

1. Tap the **FAB (+)** button
2. Select **Despesa**, enter total amount
3. Set recurrence to **Parcelado**, enter number of installments
4. Tap **Adicionar**
5. N installment transactions created with `groupId` linking them
6. Each appears in its respective month

## 4. Mark Transaction as Paid

1. On History page, tap the payment status indicator on a transaction
2. **PaymentModal** opens — select payment method (Pix, Débito, Crédito, Dinheiro)
3. Tap **Confirmar**
4. Transaction `paid` = true, `paymentMethod` saved
5. If it was a projection, it becomes a real persisted transaction

## 5. Edit Transaction

1. On History page, tap the edit (pencil) icon on a transaction
2. If transaction belongs to a recurring group:
   - **EditChoiceModal** opens: "Editar apenas este" or "Editar todos"
   - "Editar apenas este" → opens EditTransactionModal for single record
   - "Editar todos" → opens EditAllValueModal to change amount for all in group
3. If single transaction: **EditTransactionModal** opens directly
4. Make changes and tap **Salvar**

## 6. Delete Transaction

1. On History page, tap the delete (trash) icon on a transaction
2. If transaction belongs to a recurring group:
   - **DeleteChoiceModal** opens: "Excluir apenas este" or "Excluir todos"
3. If single: confirmation happens inline
4. Transaction removed from state and localStorage

## 7. Filter History by Month

1. Navigate to **Histórico** tab
2. The **FilterBar** shows months with transactions + "Todos" option
3. Tap a month pill to filter — `currentFilter` state updates
4. TransactionList re-renders showing only matching transactions

## 8. Filter by Payment Method

1. On History page, use the **PaymentTabs** row below FilterBar
2. Tabs: Todos | Pix | Débito | Crédito | Dinheiro
3. Tap a tab → `currentPaymentFilter` updates
4. TransactionList shows only transactions matching the selected method

## 9. Export Data

### JSON Backup
1. Navigate to **Config** tab
2. Tap **Exportar JSON** in the Dados section
3. Browser downloads `smartfinance-backup-YYYY-MM-DD.json`
4. File contains: transactions, goals, envelopes, cards, userPreferences

### CSV Export
1. Navigate to **Config** tab
2. Tap **Exportar CSV**
3. Browser downloads `smartfinance-transacoes-YYYY-MM-DD.csv`
4. Columns: Data, Descricao, Tipo, Valor, Pago, Metodo, Categoria, Recorrencia

## 10. Import Backup

1. Navigate to **Config** tab
2. Tap **Importar Backup**
3. File picker opens — select a `.json` file exported by SmartFinance
4. Data is parsed and saved to localStorage via `importAllData()`
5. Page reloads to re-hydrate all state from the restored data

> **Warning**: Import overwrites existing data. Export a backup first if you want to preserve current data.

## 11. Switch Theme (Dark / Light)

1. Navigate to **Config** tab
2. In Aparencia section, tap the **Modo Escuro** toggle
3. Theme switches instantly — `isDarkMode` state updates
4. `dark` class toggled on `<html>` element
5. Preference saved to `localStorage['color-theme']`

## 12. Clear All Data

1. Navigate to **Config** tab
2. In Dados section, tap **Apagar Todos os Dados** (red)
3. **ConfirmDeleteModal** opens with final confirmation
4. Tap **Confirmar** → all localStorage keys cleared, state reset
5. App returns to empty state
