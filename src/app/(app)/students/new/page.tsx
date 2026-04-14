import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AddStudentForm from './add-student-form';

export default async function AddStudentPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.userType !== 'parent') redirect('/dashboard');

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Add a Student</h1>
      </div>
      <div className="rounded border border-border bg-card p-6">
        <AddStudentForm />
      </div>
    </div>
  );
}
