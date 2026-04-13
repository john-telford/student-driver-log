import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome, {session?.user?.name}
        {session?.user?.userType === 'parent' ? ' (parent)' : ' (student)'}
      </p>
      <p className="mt-4 text-sm text-gray-400">
        Full dashboard coming in issue #7.
      </p>
    </div>
  );
}
