import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PrivacyPage from './page';

// The App Store listing's Privacy Policy URL points here, and App Review reads
// it against the app's privacy labels, so the statements that must match them
// are pinned.
describe('PrivacyPage', () => {
  const html = renderToStaticMarkup(<PrivacyPage />);
  // React escapes apostrophes; decode them so the copy can be matched verbatim.
  const text = html.replaceAll('&#x27;', "'");

  it('scopes Google Analytics to the website, not the app', () => {
    expect(html).toContain('The website uses');
    expect(html).not.toContain('inside the app');
  });

  it('states what deletion does and where it happens', () => {
    expect(html).toContain('Deleting a parent account also deletes all of its student accounts');
    expect(html).toContain('The iOS app cannot delete an account.');
  });

  // Decision 178: no retention number, and no "irreversible" claim that
  // ignores the providers' backups and logs.
  it('says deletion is immediate in the live database and copies follow the providers schedules', () => {
    expect(text).toContain(
      "Deletion removes your data from our live database immediately and can't be undone.",
    );
    expect(text).toMatch(
      /Copies in our service providers' backups and logs \(database backups, hosting logs,\s+email delivery logs\) are deleted on their own schedules\./,
    );
    expect(text).not.toContain('irreversible');
  });

  // Decision 180: each statement mirrors the code (see the commit message).
  it('discloses technical data, the GA cookies, the selected-student cookie and students', () => {
    expect(text).toContain('Technical data');
    expect(text).toContain('IP addresses in its request logs');
    expect(text).toContain(
      "Sign-in on the website and in the iOS app counts attempts by IP address and the email entered, to limit repeated failed attempts; that count is held only in the server's memory, never in our database, and stops applying after 15 minutes.",
    );
    expect(text).toMatch(/including signed-in pages/);
    expect(text).toContain('_ga');
    expect(text).toContain('a parent last selected, for 30 days');
    expect(text).toMatch(/creates each student account and controls it\. The parent can see/);
  });

  it('links the support email', () => {
    expect(html).toContain('href="mailto:support@studentdriver.site"');
  });
});
