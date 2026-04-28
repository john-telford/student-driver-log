import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Student Driver Log',
};

export default function AboutPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-black/80">

      <div className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-widest text-primary">About</h1>
        <p className="text-black/40 text-xs uppercase tracking-widest">Student Driver Log</p>
      </div>

      <section className="space-y-4">
        <p>
          Student Driver Log started as a personal itch. When my son was working toward his Illinois
          driver's license, we needed to log 50 hours of supervised driving — and the spreadsheet
          we were using wasn't cutting it. So I built something better.
        </p>
        <p>
          There are other apps that do this. This one is mine, and now yours too if it's useful.
          It's free, it runs in your browser, and it installs on your phone's home screen without
          any app store involved.
        </p>
        <p>
          It's also a small demonstration of something I find genuinely exciting: people with a
          technical background can build real, production-quality software faster than ever before —
          with AI as a collaborator rather than just a tool. This app was built almost entirely
          with AI assistance, from the database schema to the authentication system to the PDF
          report generator. If you're curious about that process, the code is open on GitHub.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">What it does</h2>
        <ul className="space-y-2 list-none">
          {[
            'Tracks daytime and nighttime driving hours for each session',
            'Supports multiple student accounts under one parent login',
            'Generates a printable report matching Illinois SOS Form DSD X 152.4',
            'Works as an installable app on iOS and Android home screens',
            'Free — no subscriptions, no ads, no account required beyond your own login',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-accent font-black shrink-0">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-black uppercase tracking-widest text-primary">Feedback & issues</h2>
        <p>
          Found a bug? Have a suggestion? The project is open source.{' '}
          <a
            href="https://github.com/john-telford/student-driver-log"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
          >
            Open an issue on GitHub
          </a>{' '}
          and I'll take a look.
        </p>
      </section>

    </div>
  );
}
