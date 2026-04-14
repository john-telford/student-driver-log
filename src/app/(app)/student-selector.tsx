'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { selectStudentAction } from './actions';

type Student = { id: number; name: string };

export default function StudentSelector({
  students,
  selectedId,
}: {
  students: Student[];
  selectedId: number;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === 'new') {
      router.push('/students/new');
      return;
    }
    const id = Number(val);
    startTransition(async () => {
      await selectStudentAction(id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/50 text-[10px] uppercase tracking-widest hidden sm:block shrink-0">
        Student
      </span>
      <select
        value={selectedId}
        onChange={handleChange}
        disabled={isPending}
        className="rounded bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wide px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 cursor-pointer"
      >
        {students.map((s) => (
          <option key={s.id} value={s.id} className="text-foreground bg-white normal-case font-normal">
            {s.name}
          </option>
        ))}
        <option value="new" className="text-primary bg-white normal-case font-semibold">
          + Add a Student
        </option>
      </select>
    </div>
  );
}
