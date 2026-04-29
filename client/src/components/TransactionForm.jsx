import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TransactionForm({ onTransactionCreated, onUnauthorized }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
    amount: '',
    type: 'Income',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const numericAmount = Number(formData.amount);

      if (!formData.text.trim() || Number.isNaN(numericAmount)) {
        throw new Error('Please enter a valid text and amount.');
      }

      const signedAmount =
        formData.type === 'Expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

      await api.post('/transactions', {
        text: formData.text.trim(),
        amount: signedAmount,
      });

      setFormData({
        text: '',
        amount: '',
        type: 'Income',
      });

      if (onTransactionCreated) {
        onTransactionCreated();
      }
    } catch (submitError) {
      if (submitError.response?.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          navigate('/login');
        }
        return;
      }

      setError(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/20">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Add Transaction
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Create income or expense entries
        </h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="text">
            Text
          </label>
          <input
            id="text"
            name="text"
            type="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Salary, groceries, rent..."
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="amount">
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="type">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Add Transaction'}
        </button>
      </form>
    </section>
  );
}
