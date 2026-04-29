import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Login from './pages/Login';
import Signup from './pages/Signup';
import supabase from './supabaseClient';

function ProtectedRoute({ user, isAuthLoading, children }) {
  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-300">
        <div className="mx-auto max-w-7xl">Checking session...</div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = Boolean(user);
  const userDisplay = user?.user_metadata?.name?.trim() || user?.email || 'User';

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 transition ${
      isActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'
    }`;

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setUser(session?.user || null);
      setIsAuthLoading(false);
    }

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, isLoggedIn]);

  function handleAuthSuccess(authenticatedUser) {
    setUser(authenticatedUser);
    navigate('/dashboard');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  }

  return (
    <div>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 text-sm text-slate-200 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Expense Tracker
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 md:hidden"
            >
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </button>

            <div className="hidden flex-wrap items-center gap-2 md:flex">
              {isLoggedIn ? (
                <>
                  <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/transactions/new" className={linkClass}>
                    Add Transaction
                  </NavLink>
                  <NavLink to="/transactions" className={linkClass}>
                    Transactions
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkClass}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className={linkClass}>
                    Signup
                  </NavLink>
                </>
              )}
            </div>

            {isLoggedIn ? (
              <div className="hidden items-center gap-2 md:flex">
                <span className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100 lg:text-sm">
                  {userDisplay}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>

          {isMobileMenuOpen ? (
            <div className="mt-3 grid gap-2 md:hidden">
              {isLoggedIn ? (
                <>
                  <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/transactions/new" className={linkClass}>
                    Add Transaction
                  </NavLink>
                  <NavLink to="/transactions" className={linkClass}>
                    Transactions
                  </NavLink>
                  <div className="mt-2 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-xs text-cyan-100">{userDisplay}</span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-left text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkClass}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className={linkClass}>
                    Signup
                  </NavLink>
                </>
              )}
            </div>
          ) : null}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} isAuthLoading={isAuthLoading}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <ProtectedRoute user={user} isAuthLoading={isAuthLoading}>
              <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] py-8 text-white">
                <div className="mx-auto max-w-7xl px-4">
                  <TransactionForm />
                </div>
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute user={user} isAuthLoading={isAuthLoading}>
              <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] py-8 text-white">
                <div className="mx-auto max-w-7xl px-4">
                  <TransactionList refreshKey={0} />
                </div>
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <Login
              onAuthSuccess={handleAuthSuccess}
              onSwitchToSignup={() => {
                navigate('/signup');
              }}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              onAuthSuccess={handleAuthSuccess}
              onSwitchToLogin={() => {
                navigate('/login');
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  );
}
