import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, requireApiUser: vi.fn() };
});
vi.mock('@/services/accounts', () => ({ deleteAccount: vi.fn(), assertParentOwnsStudent: vi.fn() }));
vi.mock('@/services/users', () => ({ getUserProfile: vi.fn() }));

import { requireApiUser } from '@/lib/api-auth';
import { deleteAccount } from '@/services/accounts';
import { getUserProfile } from '@/services/users';
import { UnauthorizedError } from '@/services/errors';
import { DELETE } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

const del = () => new Request('http://localhost:3000/api/v1/account', { method: 'DELETE' });

describe('DELETE /api/v1/account', () => {
  it.each([
    { userId: 42, userType: 'student' as const, parentId: 7 },
    { userId: 7, userType: 'parent' as const, parentId: null },
  ])('deletes the $userType caller and returns 204', async (caller) => {
    vi.mocked(requireApiUser).mockResolvedValue(caller);
    vi.mocked(getUserProfile).mockResolvedValue({} as never);
    const res = await DELETE(del());
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
    expect(deleteAccount).toHaveBeenCalledWith(caller);
  });

  it('returns 401 when the account is already gone', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({ userId: 42, userType: 'student', parentId: 7 });
    vi.mocked(getUserProfile).mockRejectedValue(new UnauthorizedError('User no longer exists'));
    const res = await DELETE(del());
    expect(res.status).toBe(401);
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it('returns 401 without a valid token', async () => {
    vi.mocked(requireApiUser).mockRejectedValue(new UnauthorizedError());
    expect((await DELETE(del())).status).toBe(401);
    expect(deleteAccount).not.toHaveBeenCalled();
  });
});
