# SmartFinance (React)

Aplicação React criada a partir da versão estática do SmartFinance, preservando layout, comportamento, acessibilidade e SEO. O projeto usa Vite, React e o CDN original do Tailwind/Chart.js para manter dependências equivalentes à implementação original.

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Build de produção:
   ```bash
   npm run build
   ```
4. Pré-visualização da build:
   ```bash
   npm run preview
   ```

## Estrutura principal

- `index.html`: mantém `<head>` original, imports do Tailwind CDN, Chart.js e favicon.
- `src/App.jsx`: orquestra estado global (transações, metas, filtros, modais, tema).
- `src/components/`: componentes funcionais extraídos das seções do HTML original.
- `public/LogoSF.png`: favicon do projeto.
- `public/LogoSFblue.png`: logotipo exibido na interface.

## Mapeamento HTML → Componentes

| Origem (index.html) | Componente / Arquivo React |
| ------------------- | -------------------------- |
| Cabeçalho com logotipo/tema (`#theme-toggle`) | `Header` |
| Área de metas de orçamento (novo) | `GoalsSection` |
| Cartões de resumo (`#total-income`, `#balance` …) | `SummaryCards` |
| Formulário `#transaction-form` | `TransactionForm` |
| Gráfico "Visão Gráfica" (`#financial-chart`) | `ChartSection` |
| Filtro temporal (`#filter-container`) | `FilterBar` |
| Abas de pagamento (`#payment-tabs-container`) | `PaymentTabs` |
| Lista de transações agrupadas | `TransactionList` |
| Modal de edição | `EditTransactionModal` |
| Modal de pagamento | `PaymentModal` |
| Modal "Limpar Tudo" | `ConfirmDeleteModal` |
| Modais de exclusão/edição de parcelas | `DeleteChoiceModal`, `EditChoiceModal`, `EditAllValueModal` |

## Notas de implementação

- Metas de renda e gastos são persistidas no `localStorage` (`smartfinance_goals`) e exibem barras de progresso.
- Dados financeiros continuam armazenados no `localStorage` (`smartfinance_transactions`).
- Tema claro/escuro usa a key `color-theme` e aplica classes Tailwind no `<body>`/`<html>`.
- Chart.js permanece via CDN global (`window.Chart`), criando e destruindo instâncias conforme filtros.

## Checklist de validação

- `npm run build` — garante que a aplicação compila sem erros.
- Verificar manualmente (via `npm run dev`):
  - definir metas de renda/gastos, observar barras de progresso;
  - adicionar renda/despesa (simples, mensal, parcelada);
  - marcar/desmarcar pagamentos e informar método/cartão;
  - editar e excluir transações, incluindo parcelas (opções "todas"/"única");
  - alternar tema claro/escuro;
  - limpar todas as transações;
  - validar responsividade em telas móveis (até 360 px) e desktops.
- Confirmar que valores, gráfico e filtros mensais refletem corretamente os dados inseridos.