import { auth } from '@/auth';
import { db } from '@/db';
import { users, type UserType } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TripForm from './trip-form';

export default async function NewTripPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id, userType: userTypeRaw } = session.user;
  const userType = userTypeRaw as UserType;
  const parentId = Number(id);

  let studentName: string | null = null;

  if (userType === 'parent') {
    const jar = await cookies();
    const cookieVal = jar.get('selected_student_id')?.value;

    if (!cookieVal) {
      // No student selected yet — check if any exist
      const students = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.parentId, parentId));

      if (students.length === 0) {
        return (
          <div className="max-w-lg space-y-6">
            <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Log a Trip</h1>
            <div className="rounded border border-border bg-card p-6 space-y-3">
              <p className="text-sm font-semibold text-foreground">No students yet</p>
              <p className="text-sm text-muted-foreground">Add a student on the dashboard first.</p>
              <Link href="/dashboard" className="inline-block rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90">
                Go to Dashboard
              </Link>
            </div>
          </div>
        );
      }

      return (
        <div className="max-w-lg space-y-6">
          <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Log a Trip</h1>
          <div className="rounded border border-border bg-card p-6 space-y-3">
            <p className="text-sm text-muted-foreground">Select a student from the nav bar first.</p>
          </div>
        </div>
      );
    }

    const studentId = Number(cookieVal);
    const [student] = await db
      .select({ name: users.name })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.parentId, parentId)));

    if (!student) {
      return (
        <div className="max-w-lg space-y-6">
          <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Log a Trip</h1>
          <div className="rounded border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Select a student from the nav bar.</p>
          </div>
        </div>
      );
    }

    studentName = student.name;
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Log a Trip</h1>
        {studentName && (
          <p className="text-sm text-muted-foreground mt-1">
            Recording a session for <span className="font-semibold text-foreground">{studentName}</span>.
          </p>
        )}
      </div>

      <div className="rounded border border-border bg-card p-6">
        <TripForm />
      </div>
    </div>
  );
}
