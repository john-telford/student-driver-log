'use client';

import { useActionState } from 'react';
import { addStudentAction, type AddStudentState } from './actions';

export default function AddStudentForm() {
  const [state, action, pending] = useActionState<AddStudentState | undefined, FormData>(
    addStudentAction,
    undefined
  );

  if (state?.success) {
    return (
      <p className="text-sm font-semibold text-primary">
        Student added. They can now log in with the email and password you set.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="studentName" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
            Name
          </label>
          <input
            id="studentName"
            name="name"
            type="text"
            required
            autoComplete="off"
            className="w-full rounded border border-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {state?.errors?.name && <p className="mt-1 text-xs text-destructive">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor="studentEmail" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
            Email
          </label>
          <input
            id="studentEmail"
            name="email"
            type="email"
            required
            autoComplete="off"
            className="w-full rounded border border-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {state?.errors?.email && <p className="mt-1 text-xs text-destructive">{state.errors.email}</p>}
        </div>
        <div>
          <label htmlFor="studentPassword" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
            Password
          </label>
          <input
            id="studentPassword"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded border border-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {state?.errors?.password && <p className="mt-1 text-xs text-destructive">{state.errors.password}</p>}
        </div>
      </div>
      {state?.errors?.form && <p className="text-xs text-destructive">{state.errors.form}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Adding…' : 'Add Student'}
      </button>
    </form>
  );
}
