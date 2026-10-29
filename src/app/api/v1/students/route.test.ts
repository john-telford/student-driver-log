import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, requireApiUser: vi.fn() };
});
vi.mock('@/services/accounts', () => ({
  listStudents: vi.fn(),
  createStudent: vi.fn(),
  assertParentOwnsStudent: vi.fn(),
}));

import { requireApiUser } from '@/lib/api-auth';
import { createStudent, listStudents } from '@/services/accounts';
import { UnauthorizedError, ValidationError } from '@/services/errors';
import { GET, POST } from './route';

const parent = { userId: 7, userType: 'parent' as const, parentId: null };
const student = { userId: 42, userType: 'student' as const, parentId: 7 };

beforeEach(() => {
  vi.clearAllMocks();
});

const url = 'http://localhost:3000/api/v1/students';
function post(body: unknown): Request {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}

describe('GET /api/v1/students', () => {
  it("lists the parent's students", async () => {
    vi.mocked(requireApiUser).mockResolvedValue(parent);
    vi.mocked(listStudents).mockResolvedValue([{ id: 42, name: 'Avery', email: 'a@example.com' }]);
    const res = await GET(new Request(url));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 42, name: 'Avery', email: 'a@example.com' }]);
    expect(listStudents).toHaveBeenCalledWith(7);
  });

  it('returns 403 for a student', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(student);
    expect((await GET(new Request(url))).status).toBe(403);
    expect(listStudents).not.toHaveBeenCalled();
  });

  it('returns 401 without a valid token', async () => {
    vi.mocked(requireApiUser).mockRejectedValue(new UnauthorizedError());
    expect((await GET(new Request(url))).status).toBe(401);
  });
});

describe('POST /api/v1/students', () => {
  it('adds a student under the parent with 201', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(parent);
    vi.mocked(createStudent).mockResolvedValue({ id: 43, name: 'Blake', email: 'b@example.com' });
    const body = { name: 'Blake', email: 'b@example.com', password: 'granite-orbit-47' };
    const res = await POST(post(body));
    expect(res.status).toBe(201);
    expect(createStudent).toHaveBeenCalledWith(7, body);
  });

  it('returns 400 with fields on invalid input', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(parent);
    vi.mocked(createStudent).mockRejectedValue(
      new ValidationError('That email is already in use.', { email: 'That email is already in use.' })
    );
    const res = await POST(post({ name: 'Blake', email: 'a@example.com', password: 'x' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.fields).toEqual({ email: 'That email is already in use.' });
  });

  it('returns 403 for a student', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(student);
    expect((await POST(post({}))).status).toBe(403);
    expect(createStudent).not.toHaveBeenCalled();
  });
});
