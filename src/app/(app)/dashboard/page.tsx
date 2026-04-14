import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {session?.user?.name}.
        </p>
      </div>

      {/* Progress summary — built in issue #7 */}
      <div className="rounded-sm border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Hour totals and progress bar coming in issue #7.
      </div>

      {/* Recent trips — built in issue #6 */}
      <div className="rounded-sm border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Recent trips list coming in issue #6.
      </div>
    </div>
  );
}
