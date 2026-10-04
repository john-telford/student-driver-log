import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SupportPage from './page';

// The App Store listing's Support URL points here, so the contact route and
// the pointers to privacy and account deletion must not silently disappear.
describe('SupportPage', () => {
  const html = renderToStaticMarkup(<SupportPage />);

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
    expect(html).toContain('Settings → Delete Account');
    expect(html).toContain('The iOS app has no delete option.');
  });
});
