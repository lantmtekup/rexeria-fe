'use client';

import { useState } from 'react';
import { ANALYTICS_CREDENTIALS } from './analytics-data';

interface Props {
  onSuccess: () => void;
}

export default function AnalyticsLogin({ onSuccess }: Props) {
  // Prefill with the demo credentials for quick access.
  const [username, setUsername] = useState(ANALYTICS_CREDENTIALS.username);
  const [password, setPassword] = useState(ANALYTICS_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username === ANALYTICS_CREDENTIALS.username &&
      password === ANALYTICS_CREDENTIALS.password
    ) {
      setError('');
      onSuccess();
    } else {
      setError('Incorrect username or password.');
    }
  };

  return (
    <div className='fixed inset-0 z-[3000] flex items-center justify-center bg-neutral-950 px-6'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl'
      >
        <h1 className='mb-1 font-serif text-xl text-white'>Analytics Access</h1>
        <p className='mb-6 text-sm text-neutral-400'>
          Log in to view the landing analytics layer.
        </p>

        <label
          htmlFor='an-user'
          className='mb-1 block text-xs text-neutral-400'
        >
          Username
        </label>
        <input
          id='an-user'
          type='text'
          autoComplete='username'
          value={username}
          onChange={e => setUsername(e.target.value)}
          className='mb-4 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-500'
          placeholder='admin'
        />

        <label
          htmlFor='an-pass'
          className='mb-1 block text-xs text-neutral-400'
        >
          Password
        </label>
        <div className='relative mb-4'>
          <input
            id='an-pass'
            type={showPassword ? 'text' : 'password'}
            autoComplete='current-password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 pr-16 text-sm text-white outline-none focus:border-amber-500'
            placeholder='••••••••'
          />
          <button
            type='button'
            onClick={() => setShowPassword(s => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className='absolute top-1/2 right-2 -translate-y-1/2 rounded px-2 py-1 text-xs text-neutral-400 transition-colors hover:text-amber-400'
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && <p className='mb-4 text-sm text-red-400'>{error}</p>}

        <button
          type='submit'
          className='w-full rounded-lg bg-amber-500 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-amber-400'
        >
          Log in
        </button>
      </form>
    </div>
  );
}
