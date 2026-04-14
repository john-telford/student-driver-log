import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { logoutAction } from './dashboard/actions';
import StudentSelector from './student-selector';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id, name, userType } = session.user;

  let students: { id: number; name: string }[] = [];
  if (userType === 'parent') {
    students = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.parentId, Number(id)));
  }

  const jar = await cookies();
  const cookieVal = jar.get('selected_student_id')?.value;
  const cookieId = cookieVal ? Number(cookieVal) : null;
  const selectedStudent =
    students.find((s) => s.id === cookieId) ?? students[0] ?? null;

  const canLogTrip = userType === 'student' || (userType === 'parent' && students.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary border-b-4 border-accent">
        <div className="max-w-4xl mx-auto px-4">
          {/* Row 1: app name + sign out */}
          <div className="h-11 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-white font-black text-sm uppercase tracking-widest hover:opacity-80"
            >
              Student Driver Log
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[10px] font-bold text-accent uppercase tracking-widest hover:opacity-80"
              >
                Sign Out
              </button>
            </form>
          </div>

          {/* Row 2: nav actions + student context */}
          <div className="pb-2.5 flex items-center gap-3">
            <Link
              href="/trips"
              className="text-white/80 text-xs font-bold uppercase tracking-widest hover:text-white"
            >
              Trips
            </Link>
            {canLogTrip && (
              <Link
                href="/trips/new"
                className="rounded bg-accent px-3 py-1 text-xs font-black text-accent-foreground uppercase tracking-widest hover:opacity-90"
              >
                + Log Trip
              </Link>
            )}

            <div className="flex-1" />

            {userType === 'parent' && students.length > 0 && selectedStudent && (
              <StudentSelector students={students} selectedId={selectedStudent.id} />
            )}
            {userType === 'student' && (
              <span className="text-white/70 text-xs uppercase tracking-wide">{name}</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
