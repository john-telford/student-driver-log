'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { deleteAccountAction } from './actions';

export default function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, undefined);
  const [confirmText, setConfirmText] = useState('');

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="confirm"
          className="block text-sm font-bold text-destructive uppercase tracking-widest mb-1"
        >
          Type DELETE to confirm
        </label>
        <input
          id="confirm"
          name="confirm"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
          className="w-full max-w-xs rounded border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
        />
      </div>

      {state?.error && (
        <p className="text-sm font-semibold text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={confirmText !== 'DELETE' || pending}
        className="rounded bg-destructive px-5 py-2.5 text-sm font-black text-white uppercase tracking-widest hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? 'Deleting…' : 'Delete My Account'}
      </button>
    </form>
  );
}
