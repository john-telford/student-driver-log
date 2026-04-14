import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import AppNav from './app-nav';

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
      <header className="bg-primary border-b-4 border-accent relative">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-white font-black text-sm uppercase tracking-widest shrink-0 hover:opacity-80"
          >
            Student Driver Log
          </Link>
          <AppNav
            userType={userType ?? ''}
            userName={name ?? ''}
            students={students}
            selectedStudent={selectedStudent}
            canLogTrip={canLogTrip}
          />
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
