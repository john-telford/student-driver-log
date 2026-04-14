import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import TripForm from './trip-form';

export default async function NewTripPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id, userType } = session.user;

  // Parents get their student list; students get an empty array (trip is for themselves)
  let students: { id: number; name: string }[] = [];
  if (userType === 'parent') {
    students = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.parentId, Number(id)));
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
        <TripForm students={students} />
      </div>
    </div>
  );
}
