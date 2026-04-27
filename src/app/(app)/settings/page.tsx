import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DeleteAccountForm from './delete-account-form';

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.userType !== 'parent') redirect('/dashboard');

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-black uppercase tracking-widest text-primary">
        Settings
      </h1>

      <section className="rounded-lg border-2 border-destructive/40 p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-destructive uppercase tracking-wide">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            Permanently deletes your account, all student accounts, and every
            trip record. <strong>This cannot be undone.</strong>
          </p>
        </div>

        <DeleteAccountForm />
      </section>
    </div>
  );
}
