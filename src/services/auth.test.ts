import { describe, it, expect, vi, beforeEach } from 'vitest';

// verifyCredentials talks to the DB and bcrypt; mock both so the unit test is
// pure logic (found/not-found, password match/mismatch).
const whereMock = vi.fn();
vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: () => ({ where: whereMock }) }),
  },
}));
vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn() },
}));

import bcrypt from 'bcryptjs';
import { verifyCredentials } from './auth';

const row = {
  id: 42,
  email: 'jimmy@example.com',
  passwordHash: '$2a$12$hash',
  name: 'Jimmy',
  userType: 'student' as const,
  parentId: 7,
  createdAt: '2026-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('verifyCredentials', () => {
  it('returns the user identity on valid credentials', async () => {
    whereMock.mockResolvedValue([row]);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const user = await verifyCredentials({
      email: 'jimmy@example.com',
      password: 'correct',
    });

    expect(user).toEqual({
      id: 42,
      name: 'Jimmy',
      email: 'jimmy@example.com',
      userType: 'student',
      parentId: 7,
    });
  });

  it('returns null when the password does not match', async () => {
    whereMock.mockResolvedValue([row]);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const user = await verifyCredentials({
      email: 'jimmy@example.com',
      password: 'wrong',
    });

    expect(user).toBeNull();
  });

  it('returns null when the email is unknown', async () => {
    whereMock.mockResolvedValue([]);

    const user = await verifyCredentials({
      email: 'nobody@example.com',
      password: 'whatever',
    });

    expect(user).toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('returns null and skips the DB on empty input', async () => {
    const user = await verifyCredentials({ email: '', password: '' });
    expect(user).toBeNull();
    expect(whereMock).not.toHaveBeenCalled();
  });
});
