import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SupportPage from './page';

// The App Store listing's Support URL points here, so the contact route and
// the pointers to privacy and account deletion must not silently disappear.
describe('SupportPage', () => {
  const html = renderToStaticMarkup(<SupportPage />);
  // React escapes apostrophes; decode them so the copy can be matched verbatim.
  const text = html.replaceAll('&#x27;', "'");

  it('links the support email', () => {
    expect(html).toContain('href="mailto:support@studentdriver.site"');
    expect(html).toContain('>support@studentdriver.site<');
  });

  it('points to the privacy policy and the FAQ', () => {
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/faq"');
  });

  it('covers both the website and the iOS app, and where deletion happens', () => {
    expect(html).toContain('Teen Driver Log');
    expect(html).toContain('Settings → Danger Zone');
    expect(html).toContain('Delete My Account');
    // App Review 2026-10-29 (Guideline 5.1.1(v)): the iOS app deletes accounts too.
    expect(html).toContain('Account → Delete account');
    expect(html).toContain('the parent account stays');
    expect(html).not.toContain('The iOS app cannot delete an account.');
  });

  // Decision 178's short form: immediate in the live database, not in backups.
  it('says deletion is immediate in the live database, with backup copies on their own schedules', () => {
    expect(text).toMatch(/from our live database immediately and can't be undone/);
    expect(text).toMatch(/backups and logs are deleted on their own schedules/);
    expect(text).not.toContain('cannot be undone');
  });
});
