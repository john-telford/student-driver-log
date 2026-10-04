import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Student Driver Log',
};

const EFFECTIVE_DATE = 'October 4, 2026';

export default function PrivacyPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-black/80">

      <div className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-widest text-primary">Privacy Policy</h1>
        <p className="text-black/40 text-xs uppercase tracking-widest">Effective {EFFECTIVE_DATE}</p>
      </div>

      <p>
        Student Driver Log is a free, personal project. This policy explains what data is collected,
        how it's used, and what your options are. Plain English throughout.
      </p>

      <p>
        It covers both the website (studentdriver.site) and the iOS app,{' '}
        <span className="font-bold">Teen Driver Log</span> (on your home screen the app is named
        Driver Log). Both use the same accounts and store data in the same place.
      </p>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">What we collect</h2>
        <ul className="space-y-2">
          <li><span className="font-bold">Account data</span> — your name and email address when you register.</li>
          <li><span className="font-bold">Password</span> — stored as a one-way hash (bcrypt). We cannot read your password.</li>
          <li><span className="font-bold">Driving sessions</span> — date, duration (day/night minutes), location type, weather conditions, and optional notes that you enter.</li>
          <li><span className="font-bold">Student accounts</span> — names and emails of student accounts you create as a parent.</li>
          <li><span className="font-bold">Session cookies</span> — on the website, used to keep you logged in (8-hour expiry). A separate cookie remembers which student account you last selected.</li>
          <li><span className="font-bold">iOS app</span> — signs in with the same email and password and sends the same driving-session data. It keeps your sign-in in the iOS Keychain on your device instead of cookies.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Analytics</h2>
        <p>
          The website uses <span className="font-bold">Google Analytics 4</span> to understand aggregate
          usage patterns (page views, general traffic). Google Analytics collects your IP address and
          browser information. You can opt out using the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          .
        </p>
        <p>
          The iOS app contains <span className="font-bold">no analytics and no tracking</span> — no
          Google Analytics and no other analytics, advertising or tracking code.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Third-party services</h2>
        <p>Your data passes through these services to run the website and the iOS app:</p>
        <ul className="space-y-2">
          <li><span className="font-bold">Vercel</span> — hosting and serving the application.</li>
          <li><span className="font-bold">Turso</span> — the database where your account and driving log data is stored.</li>
          <li><span className="font-bold">Resend</span> — sends password reset emails on your request. Your email address is transmitted to Resend only when a reset is initiated.</li>
        </ul>
        <p>No data is sold to third parties. Ever.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Data retention & deletion</h2>
        <p>
          Your data is kept for as long as your account exists. A parent or guardian can
          permanently delete their account on the website: sign in to the parent account and go
          to <span className="font-bold">Settings → Delete Account</span>. Deleting a parent
          account also deletes all of its student accounts and every driving session. Deletion is
          immediate and irreversible.
        </p>
        <p>
          The iOS app has no delete option. Accounts, including student accounts, are deleted on
          the website by the parent or guardian.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Questions</h2>
        <p>
          For privacy-related questions or requests, email{' '}
          <a
            href="mailto:support@studentdriver.site"
            className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
          >
            support@studentdriver.site
          </a>{' '}
          or{' '}
          <a
            href="https://github.com/john-telford/student-driver-log"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
          >
            open an issue on GitHub
          </a>
          . This app is governed by the laws of the State of Illinois, USA.
        </p>
      </section>

    </div>
  );
}
