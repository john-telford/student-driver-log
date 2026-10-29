import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { SignJWT } from 'jose';

vi.mock('@/services/accounts', () => ({ assertParentOwnsStudent: vi.fn() }));

import { issueApiToken, requireApiUser, resolveApiStudentId } from './api-auth';
import { assertParentOwnsStudent } from '@/services/accounts';
import { NotFoundError, UnauthorizedError, ValidationError } from '@/services/errors';

const SECRET = 'test-secret-value-at-least-32-characters-long!!';

beforeAll(() => {
  process.env.API_JWT_SECRET = SECRET;
});

function req(authorization?: string): Request {
  return new Request('http://localhost:3000/api/v1/trips', {
    headers: authorization ? { authorization } : {},
  });
}

describe('issueApiToken / requireApiUser round-trip', () => {
  it('accepts a freshly issued token and returns the caller context', async () => {
    const token = await issueApiToken({
      id: 42,
      userType: 'student',
      parentId: 7,
    });

    const caller = await requireApiUser(req(`Bearer ${token}`));

    expect(caller).toEqual({ userId: 42, userType: 'student', parentId: 7 });
  });

  it('carries a null parentId through the token', async () => {
    const token = await issueApiToken({
      id: 1,
      userType: 'parent',
      parentId: null,
    });
    const caller = await requireApiUser(req(`Bearer ${token}`));
    expect(caller.parentId).toBeNull();
  });

  it('accepts a case-insensitive bearer scheme (RFC 7235)', async () => {
    const token = await issueApiToken({
      id: 42,
      userType: 'student',
      parentId: 7,
    });
    const caller = await requireApiUser(req(`bearer ${token}`));
    expect(caller.userId).toBe(42);
  });
});

describe('requireApiUser rejections', () => {
  it('rejects a missing Authorization header', async () => {
    await expect(requireApiUser(req())).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it('rejects a non-Bearer scheme', async () => {
    await expect(
      requireApiUser(req('Basic dXNlcjpwYXNz'))
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects a malformed/garbage token', async () => {
    await expect(
      requireApiUser(req('Bearer not-a-real-jwt'))
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = await new SignJWT({ userType: 'student', parentId: null })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('42')
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(new TextEncoder().encode('a-totally-different-secret-value-here!!'));

    await expect(
      requireApiUser(req(`Bearer ${forged}`))
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects a validly-signed token whose sub is not a number', async () => {
    const bad = await new SignJWT({ userType: 'student', parentId: null })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('not-a-number')
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(new TextEncoder().encode(SECRET));

    await expect(
      requireApiUser(req(`Bearer ${bad}`))
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects an expired token', async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const expired = await new SignJWT({ userType: 'student', parentId: null })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('42')
      .setIssuedAt(nowSec - 3600)
      .setExpirationTime(nowSec - 60)
      .sign(new TextEncoder().encode(SECRET));

    await expect(
      requireApiUser(req(`Bearer ${expired}`))
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

describe('resolveApiStudentId', () => {
  const student = { userId: 42, userType: 'student' as const, parentId: 7 };
  const parent = { userId: 7, userType: 'parent' as const, parentId: null };
  const req = (query = '') => new Request(`http://localhost:3000/api/v1/trips${query}`);

  beforeEach(() => {
    vi.mocked(assertParentOwnsStudent).mockReset();
    vi.mocked(assertParentOwnsStudent).mockResolvedValue(undefined);
  });

  it('gives a student their own id, with or without ?studentId', async () => {
    await expect(resolveApiStudentId(student, req())).resolves.toBe(42);
    await expect(resolveApiStudentId(student, req('?studentId=42'))).resolves.toBe(42);
    expect(assertParentOwnsStudent).not.toHaveBeenCalled();
  });

  it("404s a student naming someone else's id", async () => {
    await expect(resolveApiStudentId(student, req('?studentId=43'))).rejects.toBeInstanceOf(NotFoundError);
  });

  it('requires a parent to name a student', async () => {
    await expect(resolveApiStudentId(parent, req())).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects a malformed studentId', async () => {
    for (const bad of ['abc', '0', '-1', '1e3', '0x10', '']) {
      await expect(resolveApiStudentId(parent, req(`?studentId=${bad}`))).rejects.toBeInstanceOf(ValidationError);
    }
  });

  it("gives a parent their own student's id after checking ownership", async () => {
    await expect(resolveApiStudentId(parent, req('?studentId=42'))).resolves.toBe(42);
    expect(assertParentOwnsStudent).toHaveBeenCalledWith(7, 42);
  });

  it("passes the ownership 404 through for another family's student", async () => {
    vi.mocked(assertParentOwnsStudent).mockRejectedValue(new NotFoundError('Student not found.'));
    await expect(resolveApiStudentId(parent, req('?studentId=99'))).rejects.toBeInstanceOf(NotFoundError);
  });
});
