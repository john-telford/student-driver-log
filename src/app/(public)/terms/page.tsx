import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use — Student Driver Log',
};

const EFFECTIVE_DATE = 'April 27, 2026';

export default function TermsPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-black/80">

      <div className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-widest text-primary">Terms of Use</h1>
        <p className="text-black/40 text-xs uppercase tracking-widest">Effective {EFFECTIVE_DATE}</p>
      </div>

      <p>
        By using Student Driver Log you agree to these terms. They're short and in plain English.
      </p>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">What this app is</h2>
        <p>
          Student Driver Log is a free, personal tool to help families track supervised driving
          hours. It is not affiliated with the Illinois Secretary of State, the Illinois Department
          of Transportation, or any government agency. It is not legal advice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">No warranty</h2>
        <p>
          This app is provided <span className="font-bold">as-is</span>, free of charge, with no
          guarantees. We make no warranty that the hour calculations, report formats, or
          requirements information are accurate, complete, or current. Illinois driving requirements
          can change — always verify with the{' '}
          <a
            href="https://www.ilsos.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
          >
            Illinois Secretary of State
          </a>{' '}
          before relying on this app for any official purpose.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Your responsibility</h2>
        <p>
          You are responsible for the accuracy of the data you enter. This app records what you
          tell it. It cannot verify that driving sessions actually occurred.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, the creator of this app is not liable for any
          damages arising from its use — including but not limited to reliance on inaccurate hour
          counts or report formats.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Service availability</h2>
        <p>
          This is a personal project. The service may be changed, paused, or discontinued at any
          time without notice. Export or print your report before you need it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Governing law</h2>
        <p>These terms are governed by the laws of the State of Illinois, USA.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Questions</h2>
        <p>
          <a
            href="https://github.com/john-telford/student-driver-log"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
          >
            Open an issue on GitHub
          </a>{' '}
          with any questions or concerns.
        </p>
      </section>

    </div>
  );
}
