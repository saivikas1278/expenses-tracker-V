import { useState } from 'react';
import supabase from '../supabaseClient';

export default function Login({ onAuthSuccess, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    if (payload.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword(payload);

      if (error || !data.session || !data.user) {
        if (error?.message) {
          console.log(error.message);
        }

        if (error?.status === 429 || error?.message?.toLowerCase().includes('rate limit')) {
          setError('Wait a few minutes before trying again.');
          return;
        }

        throw new Error(error?.message || 'Login failed');
      }

      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
    } catch (submitError) {
      console.log(submitError.message);
      const message = submitError.message || '';

      if (message.toLowerCase().includes('rate limit') || message.includes('429')) {
        setError('Wait a few minutes before trying again.');
        return;
      }

      if (message.toLowerCase().includes('invalid')) {
        setError('Invalid email or password. If you are new, sign up first.');
      } else {
        setError(message || 'Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Expense Tracker
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Sign in</h1>
          <p className="mt-2 text-sm text-slate-300">Access your private dashboard.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                placeholder="Enter your password"
              />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <button
            type="button"
            onClick={onSwitchToSignup}
            disabled={isSubmitting}
            className="mt-4 w-full text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
          >
            Need an account? Sign up
          </button>
        </section>
      </div>
    </main>
  );
}
