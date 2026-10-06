import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import TermsPage from './page';

// /terms is the App Store listing's Terms URL; its Questions section must
// reach the support mailbox, not only public GitHub issues.
describe('TermsPage', () => {
  const html = renderToStaticMarkup(<TermsPage />);

  it('links the support email', () => {
    expect(html).toContain('href="mailto:support@studentdriver.site"');
    expect(html).toContain('>support@studentdriver.site<');
  });
});
