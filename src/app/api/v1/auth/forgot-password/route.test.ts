import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/services/password-reset', () => ({
  RESET_REQUESTED_MESSAGE: "If that email is registered, you'll receive a link shortly.",
  requestPasswordReset: vi.fn(),
}));

import { requestPasswordReset } from '@/services/password-reset';
import { POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

let ipCounter = 0;
function post(body: unknown, ip = `10.1.0.${++ipCounter}`): Request {
  return new Request('https://www.studentdriver.site/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/auth/forgot-password', () => {
  it('sends the reset from the request origin and returns the neutral message', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue('sent');
    const res = await POST(post({ email: ' Pat@Example.com ' }));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ message: "If that email is registered, you'll receive a link shortly." });
    expect(requestPasswordReset).toHaveBeenCalledWith('pat@example.com', 'https://www.studentdriver.site');
  });

  it('gives an unknown email the same answer', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue('unknown_email');
    const res = await POST(post({ email: 'nobody@example.com' }));
    expect(res.status).toBe(202);
  });

  it('returns 400 for a malformed email without sending', async () => {
    const res = await POST(post({ email: 'nope' }));
    expect(res.status).toBe(400);
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it('limits repeated requests for one email from one IP', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue('sent');
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await POST(post({ email: 'pat@example.com' }, '10.8.8.8'))).status);
    expect(statuses).toEqual([202, 202, 202, 202, 202, 429]);
  });
});
