import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { logoutAction } from './dashboard/actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id, name, userType } = session.user;

  // Parents see a list of their students in the nav
  let students: { id: number; name: string }[] = [];
  if (userType === 'parent') {
    students = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.parentId, Number(id)));
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-primary border-b-4 border-accent">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* App name */}
          <span className="text-white font-black text-sm uppercase tracking-widest shrink-0">
            Student Driver Log
          </span>

          <div className="flex-1" />

          {/* Parent: student selector */}
          {userType === 'parent' && students.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-[10px] uppercase tracking-widest hidden sm:block">
                Student
              </span>
              {/* Static for now — issue #5 will wire up active student selection */}
              <span className="text-accent text-xs font-bold uppercase tracking-wide">
                {students.map((s) => s.name).join(', ')}
              </span>
            </div>
          )}

          {/* Student: just show their name */}
          {userType === 'student' && (
            <span className="text-white/70 text-xs uppercase tracking-wide">{name}</span>
          )}

          {/* Logout */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-[10px] font-bold text-accent uppercase tracking-widest hover:opacity-80"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
