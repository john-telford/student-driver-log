import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PrivacyPage from './page';

// The App Store listing's Privacy Policy URL points here, and App Review reads
// it against the app's privacy labels, so the statements that must match them
// are pinned.
describe('PrivacyPage', () => {
  const html = renderToStaticMarkup(<PrivacyPage />);

  it('scopes Google Analytics to the website, not the app', () => {
    expect(html).toContain('The website uses');
    expect(html).not.toContain('inside the app');
  });

  it('states what deletion does and where it happens', () => {
    expect(html).toContain('Deleting a parent account also deletes all of its student accounts');
    expect(html).toContain('The iOS app cannot delete an account.');
  });

  it('links the support email', () => {
    expect(html).toContain('href="mailto:support@studentdriver.site"');
  });
});
