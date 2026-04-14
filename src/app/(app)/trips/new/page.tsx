import { auth } from '@/auth';
import { db } from '@/db';
import { users, type UserType } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TripForm from './trip-form';

export default async function NewTripPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id, userType: userTypeRaw } = session.user;
  const userType = userTypeRaw as UserType;

  let students: { id: number; name: string }[] = [];
  if (userType === 'parent') {
    students = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.parentId, Number(id)));
  }

  // Parent with no students can't log a trip yet
  if (userType === 'parent' && students.length === 0) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">
          Log a Trip
        </h1>
        <div className="rounded border border-border bg-card p-6 space-y-3">
          <p className="text-sm font-semibold text-foreground">No students yet</p>
          <p className="text-sm text-muted-foreground">
            You need to add a student before you can log a trip.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90"
          >
            Add a Student
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">
          Log a Trip
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record a practice driving session.
        </p>
      </div>

      <div className="rounded border border-border bg-card p-6">
        <TripForm students={students} userType={userType} />
      </div>
    </div>
  );
}
