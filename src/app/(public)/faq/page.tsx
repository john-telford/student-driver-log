import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ — Student Driver Log',
};

function Q({ children }: { children: React.ReactNode }) {
  return <h2 className="font-black uppercase tracking-widest text-primary">{children}</h2>;
}

function A({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2 text-sm leading-relaxed text-black/80">{children}</div>;
}

export default function FaqPage() {
  return (
    <div className="space-y-8">

      <div className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-widest text-primary">FAQ</h1>
        <p className="text-black/40 text-xs uppercase tracking-widest">Frequently Asked Questions</p>
      </div>

      {/* ── iOS home screen ── */}
      <section className="space-y-3">
        <Q>How do I add this to my iPhone home screen?</Q>
        <A>
          <p>Student Driver Log works as an installable app on iOS — no App Store required.</p>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Open <span className="font-bold">studentdriver.site</span> in Safari (must be Safari, not Chrome).</li>
            <li>Tap the <span className="font-bold">Share</span> button at the bottom of the screen (the box with an arrow pointing up).</li>
            <li>Scroll down and tap <span className="font-bold">Add to Home Screen</span>.</li>
            <li>Tap <span className="font-bold">Add</span> in the top right corner.</li>
          </ol>
          <p>The app icon will appear on your home screen and launch fullscreen — no browser chrome.</p>
        </A>
      </section>

      {/* ── Android home screen ── */}
      <section className="space-y-3">
        <Q>How do I add this to my Android home screen?</Q>
        <A>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Open <span className="font-bold">studentdriver.site</span> in Chrome.</li>
            <li>Tap the three-dot menu in the top right.</li>
            <li>Tap <span className="font-bold">Add to Home screen</span>.</li>
            <li>Tap <span className="font-bold">Add</span> to confirm.</li>
          </ol>
          <p>The app launches fullscreen from your home screen, just like a native app.</p>
        </A>
      </section>

      {/* ── Forgot password ── */}
      <section className="space-y-3">
        <Q>I forgot my password. How do I reset it?</Q>
        <A>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Go to the <Link href="/login" className="text-primary font-bold underline underline-offset-2 hover:opacity-70">Sign In</Link> page.</li>
            <li>Click <span className="font-bold">Forgot?</span> next to the Password field.</li>
            <li>Enter your email address and click <span className="font-bold">Send Reset Link</span>.</li>
            <li>Check your inbox (and spam folder) for an email from Student Driver Log.</li>
            <li>Click the link in the email and enter a new password.</li>
          </ol>
          <p>Reset links expire after 1 hour and can only be used once.</p>
        </A>
      </section>

      {/* ── Illinois hours ── */}
      <section className="space-y-3">
        <Q>What are the Illinois driving hour requirements?</Q>
        <A>
          <p>
            Based on our best understanding, Illinois requires student drivers to complete{' '}
            <span className="font-bold">50 total hours</span> of supervised driving practice,
            including at least <span className="font-bold">10 hours at night</span>, before
            taking the road test.
          </p>
          <p className="text-black/60 text-xs border-l-2 border-accent pl-3">
            <span className="font-bold">Important:</span> Requirements can change. Always verify
            the current rules with the{' '}
            <a
              href="https://www.ilsos.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
            >
              Illinois Secretary of State
            </a>{' '}
            before relying on this information for any official purpose. Use this app at your own risk.
          </p>
        </A>
      </section>

      {/* ── Add a student ── */}
      <section className="space-y-3">
        <Q>How do I add a student?</Q>
        <A>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Sign in to your <span className="font-bold">parent account</span>.</li>
            <li>From the dashboard, click <span className="font-bold">Add Student</span>.</li>
            <li>Enter the student's name and a login email and password for their account.</li>
            <li>Click <span className="font-bold">Add Student</span> to save.</li>
          </ol>
          <p>The student can then log in separately with their own credentials to view their hours.</p>
        </A>
      </section>

      {/* ── Switch students ── */}
      <section className="space-y-3">
        <Q>How do I switch between students?</Q>
        <A>
          <p>
            If you have more than one student, a student selector appears in the top navigation bar.
            Click it to switch — the dashboard and trip log will update to show the selected
            student's data.
          </p>
        </A>
      </section>

      {/* ── Still have questions ── */}
      <section className="pt-4 border-t border-black/10 space-y-2">
        <p className="text-sm text-black/60">
          Still have a question?{' '}
          <a
            href="https://github.com/john-telford/student-driver-log"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
          >
            Open an issue on GitHub
          </a>
          .
        </p>
      </section>

    </div>
  );
}
