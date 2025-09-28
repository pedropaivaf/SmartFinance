SmartFinance (React)
Aplicação React baseada na versão estática do SmartFinance, preservando layout, comportamento, acessibilidade e SEO. Usa Vite + React, mantendo Tailwind e Chart.js via CDN para compatibilidade com o original.

Projeto rodando em -> https://smartfinance-app.netlify.app/

Estrutura

index.html: <head> original, Tailwind CDN, Chart.js e favicon.
src/App.jsx: estado global (transações, metas, filtros, modais, tema).
src/components/: componentes da interface.
public/LogoSF.png e public/LogoSFblue.png: ícones e logotipo.
Componentes Principais

Header (cabeçalho/tema), GoalsSection (metas e progresso), SummaryCards (resumo),
TransactionForm (formulário), ChartSection (gráfico), FilterBar (filtros),
PaymentTabs (abas de pagamento), TransactionList (lista), modais de edição/remoção.
Notas

Dados em localStorage: smartfinance_transactions e smartfinance_goals.
Tema claro/escuro via color-theme e classes Tailwind.
Chart.js via CDN (window.Chart), recriado conforme filtros.
Barras de progresso: renda azul-escuro → concluída azul-claro; gastos com escala verde/âmbar/laranja/rosa.
