import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TransactionList({
  refreshKey,
  onTransactionsLoaded,
  onUnauthorized,
  visibleTransactions,
  selectedMonthLabel,
}) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTransactions() {
    try {
      setError('');
      setIsLoading(true);

      const response = await api.get('/transactions');
      const fetchedTransactions = Array.isArray(response.data) ? response.data : [];

      setTransactions(fetchedTransactions);

      if (onTransactionsLoaded) {
        onTransactionsLoaded(fetchedTransactions);
      }
    } catch (fetchError) {
      if (fetchError.response?.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          navigate('/login');
        }
        return;
      }

      setError('Unable to load transactions. Make sure the backend is running.');
      console.error('Failed to fetch transactions:', fetchError);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [refreshKey]);

  async function handleDelete(id) {
    try {
      await api.delete(`/transactions/${id}`);
      await loadTransactions();
    } catch (deleteError) {
      if (deleteError.response?.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          navigate('/login');
        }
        return;
      }

      setError(deleteError.response?.data?.message || 'Failed to delete transaction.');
    }
  }

  const sourceTransactions = Array.isArray(visibleTransactions) ? visibleTransactions : transactions;

  const filteredTransactions = sourceTransactions.filter((transaction) => {
    const amount = Number(transaction.amount) || 0;

    if (filter === 'Income') {
      return amount >= 0;
    }

    if (filter === 'Expense') {
      return amount < 0;
    }

    return true;
  });

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/20 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Transactions
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
            Recent activity
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400 sm:w-auto"
          >
            <option value="All">All</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <button
            type="button"
            onClick={loadTransactions}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Loading transactions...</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : filteredTransactions.length === 0 ? (
        <p className="text-slate-400">
          {selectedMonthLabel
            ? `No transactions found for ${selectedMonthLabel}.`
            : 'No transactions yet. Add one to get started.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const amount = Number(transaction.amount) || 0;
            const isIncome = amount >= 0;
            const transactionId = transaction.id || transaction._id;
            const createdDate = transaction.created_at || transaction.createdAt;

            return (
              <li
                key={transactionId}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{transaction.text}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {createdDate
                      ? new Date(createdDate).toLocaleString()
                      : 'No date available'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      isIncome
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {isIncome ? '+' : '-'}${Math.abs(amount).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(transactionId)}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
