import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support — Student Driver Log',
};

const SUPPORT_EMAIL = 'support@studentdriver.site';

const linkClass = 'text-primary font-bold underline underline-offset-2 hover:opacity-70';

export default function SupportPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-black/80">

      <div className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-widest text-primary">Support</h1>
        <p className="text-black/40 text-xs uppercase tracking-widest">Student Driver Log</p>
      </div>

      <p>
        Support covers both the website (studentdriver.site) and the iOS app, Teen Driver Log
        (named Driver Log on your home screen).
      </p>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Get help</h2>
        <p>
          Email{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
            {SUPPORT_EMAIL}
          </a>{' '}
          with your question. Say whether you use the website or the iOS app, and never send
          your password.
        </p>
        <p>
          Many common questions, such as resetting a password or adding a student, are answered in
          the{' '}
          <Link href="/faq" className={linkClass}>
            FAQ
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Deleting your account</h2>
        <p>
          A parent or guardian deletes their account on the website. Sign in to the parent
          account, go to <span className="font-bold">Settings → Danger Zone</span>, type DELETE
          to confirm, and choose <span className="font-bold">Delete My Account</span>. This also
          deletes all of its student accounts and every driving session. It removes your data
          from our live database immediately and can&apos;t be undone; copies in our service
          providers&apos; backups and logs are deleted on their own schedules. A student account
          cannot be deleted on its own; it is deleted with the parent account it belongs to. The
          iOS app cannot delete an account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Privacy</h2>
        <p>
          What data is collected and how it is used is described in the{' '}
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      </section>

    </div>
  );
}
