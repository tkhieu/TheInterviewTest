import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@campaign-manager/ui';
import { useLoginMutation } from '../api.js';
import { credentialsReceived, useAppDispatch } from '../store.js';

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(credentialsReceived({ user: res.user, token: res.token }));
      navigate('/', { replace: true });
    } catch {
      // surfaced via the `error` state below
    }
  };

  const errorMessage = (() => {
    if (!error) return null;
    if ('data' in error && error.data && typeof error.data === 'object' && 'error' in error.data) {
      const inner = (error.data as { error: { message?: string } }).error;
      return inner?.message ?? 'Login failed';
    }
    return 'Login failed';
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 bg-surface border border-border rounded-lg p-6 shadow-soft"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.011em] text-fg">Sign in</h1>
          <p className="text-[13.5px] text-fg-muted mt-1">to your Campaign Manager account</p>
        </div>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMessage && (
          <p className="text-[13px] text-rose-600" role="alert">
            {errorMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-md bg-fg text-bg text-[13.5px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
