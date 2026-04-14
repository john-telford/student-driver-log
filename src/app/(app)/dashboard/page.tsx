import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import AddStudentForm from './add-student-form';

export default async function DashboardPage() {
  const session = await auth();
  const { name, userType, id } = session!.user;

  let students: { id: number; name: string; email: string }[] = [];
  if (userType === 'parent') {
    students = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.parentId, Number(id)));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {name}.</p>
      </div>

      {/* Parent: student management */}
      {userType === 'parent' && (
        <div className="rounded border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-foreground">
            Students
          </h2>

          {students.length > 0 ? (
            <ul className="space-y-1">
              {students.map((s) => (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">{s.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No students yet. Add one below to start logging trips.
            </p>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Add a Student
            </p>
            <AddStudentForm />
          </div>
        </div>
      )}

      {/* Progress summary — built in issue #7 */}
      <div className="rounded border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Hour totals and progress bar coming in issue #7.
      </div>

      {/* Recent trips — built in issue #6 */}
      <div className="rounded border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Recent trips list coming in issue #6.
      </div>
    </div>
  );
}
