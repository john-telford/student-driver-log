'use client';

import { useActionState } from 'react';
import { addStudentAction, type AddStudentState } from './actions';

const inputClass =
  'w-full rounded border border-input px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-foreground mb-1';
const errorClass = 'mt-1 text-xs text-destructive';

export default function AddStudentForm() {
  const [state, action, pending] = useActionState<AddStudentState | undefined, FormData>(
    addStudentAction,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="studentName" className={labelClass}>Name</label>
        <input
          id="studentName"
          name="name"
          type="text"
          required
          autoComplete="off"
          className={inputClass}
        />
        {state?.errors?.name && <p className={errorClass}>{state.errors.name}</p>}
      </div>
      <div>
        <label htmlFor="studentEmail" className={labelClass}>Email</label>
        <input
          id="studentEmail"
          name="email"
          type="email"
          required
          autoComplete="off"
          className={inputClass}
        />
        {state?.errors?.email && <p className={errorClass}>{state.errors.email}</p>}
      </div>
      <div>
        <label htmlFor="studentPassword" className={labelClass}>Password</label>
        <input
          id="studentPassword"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
        {state?.errors?.password && <p className={errorClass}>{state.errors.password}</p>}
      </div>
      {state?.errors?.form && <p className={errorClass}>{state.errors.form}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Adding…' : 'Add Student'}
      </button>
    </form>
  );
}
