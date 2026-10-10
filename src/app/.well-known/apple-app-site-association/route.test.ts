import { describe, it, expect } from 'vitest';
import { APP_ID, GET } from './route';

describe('GET /.well-known/apple-app-site-association', () => {
  it('lists the iOS app for shared web credentials', async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ webcredentials: { apps: [APP_ID] } });
  });

  it('serves JSON, as Apple requires', () => {
    expect(GET().headers.get('content-type')).toMatch(/^application\/json/);
  });

  it('names the app as <Team ID>.<bundle ID>', () => {
    expect(APP_ID).toMatch(/^[A-Z0-9]{10}\.site\.studentdriver\.ios$/);
  });
});
