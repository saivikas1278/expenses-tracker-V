export default function Balance({ transactions }) {
  const totals = transactions.reduce(
    (accumulator, transaction) => {
      const amount = Number(transaction.amount) || 0;

      accumulator.balance += amount;

      if (amount >= 0) {
        accumulator.income += amount;
      } else {
        accumulator.expenses += Math.abs(amount);
      }

      return accumulator;
    },
    {
      balance: 0,
      income: 0,
      expenses: 0,
    }
  );

  const cards = [
    {
      label: 'Total Balance',
      value: totals.balance,
      tone: 'from-cyan-500 to-blue-600',
      prefix: '$',
    },
    {
      label: 'Total Income',
      value: totals.income,
      tone: 'from-emerald-500 to-teal-600',
      prefix: '$',
    },
    {
      label: 'Total Expenses',
      value: totals.expenses,
      tone: 'from-rose-500 to-orange-500',
      prefix: '$',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.tone}`}
          />
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
            {card.label}
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            {card.prefix}
            {card.value.toFixed(2)}
          </h2>
        </article>
      ))}
    </section>
  );
}
