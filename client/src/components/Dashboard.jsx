import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Balance from './Balance';
import ExpenseChart from './ExpenseChart';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function Dashboard({ user, onLogout }) {
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }),
    []
  );
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  const selectedMonthLabel = monthFormatter.format(selectedMonthDate);
  const selectedMonth = selectedMonthDate.getMonth();
  const selectedYear = selectedMonthDate.getFullYear();

  const availableYears = useMemo(() => {
    const yearsFromTransactions = transactions
      .map((transaction) => {
        const transactionDate = new Date(transaction.created_at || transaction.createdAt || Date.now());
        return Number.isNaN(transactionDate.getTime()) ? null : transactionDate.getFullYear();
      })
      .filter(Boolean);

    const yearSet = new Set([selectedYear, ...yearsFromTransactions]);
    for (let offset = -2; offset <= 2; offset += 1) {
      yearSet.add(selectedYear + offset);
    }

    return Array.from(yearSet).sort((first, second) => second - first);
  }, [selectedYear, transactions]);

  const monthTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.created_at || transaction.createdAt || Date.now());

      if (Number.isNaN(transactionDate.getTime())) {
        return false;
      }

      return (
        transactionDate.getMonth() === selectedMonth &&
        transactionDate.getFullYear() === selectedYear
      );
    });
  }, [transactions, selectedMonth, selectedYear]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  function handleTransactionCreated() {
    setRefreshKey((current) => current + 1);
  }

  function handleTransactionsLoaded(fetchedTransactions) {
    setTransactions(fetchedTransactions);
  }

  function handleUnauthorized() {
    if (onLogout) {
      onLogout();
      return;
    }

    navigate('/login');
  }

  function goToPreviousMonth() {
    setSelectedMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setSelectedMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  }

  function handleMonthSelect(event) {
    const monthIndex = Number(event.target.value);
    setSelectedMonthDate((current) => new Date(current.getFullYear(), monthIndex, 1));
  }

  function handleYearSelect(event) {
    const yearValue = Number(event.target.value);
    setSelectedMonthDate((current) => new Date(yearValue, current.getMonth(), 1));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-10">
        <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur sm:mb-8 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
                Expense Tracker
              </p>
              <h1 className="mt-2 bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl md:text-4xl">
                Budget Dashboard
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Track income, expenses, and your running balance with a clean MERN stack dashboard.
              </p>
            </div>
            <div className="relative self-end md:self-start" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((current) => !current)}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition hover:border-cyan-400"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white">
                  {userInitial}
                </span>
                <span className="text-sm font-semibold text-slate-100">{displayName}</span>
              </button>

              {isProfileMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-xl shadow-black/30">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 sm:mb-8 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400"
              >
                ←
              </button>
              <h2 className="min-w-[150px] text-lg font-semibold text-cyan-200 sm:min-w-[190px] sm:text-xl">
                {selectedMonthLabel}
              </h2>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
              <select
                value={selectedMonth}
                onChange={handleMonthSelect}
                className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
              >
                {Array.from({ length: 12 }, (_, monthIndex) => (
                  <option key={monthIndex} value={monthIndex}>
                    {new Date(2026, monthIndex, 1).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={handleYearSelect}
                className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
              >
                {availableYears.map((yearValue) => (
                  <option key={yearValue} value={yearValue}>
                    {yearValue}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="space-y-6 sm:space-y-8">
          <Balance transactions={monthTransactions} />

          <ExpenseChart transactions={monthTransactions} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TransactionForm
              onTransactionCreated={handleTransactionCreated}
              onUnauthorized={handleUnauthorized}
            />
            <TransactionList
              refreshKey={refreshKey}
              onTransactionsLoaded={handleTransactionsLoaded}
              onUnauthorized={handleUnauthorized}
              visibleTransactions={monthTransactions}
              selectedMonthLabel={selectedMonthLabel}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
