import { requireApiUser, type ApiCaller } from '@/lib/api-auth';
import { readJsonObject } from '@/lib/api-body';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { clientIp } from '@/lib/rate-limit';
import { securityEvent } from '@/lib/security-event';
import { createStudent, listStudents } from '@/services/accounts';
import { ForbiddenError, ValidationError } from '@/services/errors';

// A parent's student accounts. Parent tokens only: a student gets 403.

function requireParent(caller: ApiCaller): number {
  if (caller.userType !== 'parent') {
    throw new ForbiddenError('Only parent accounts can manage students.');
  }
  return caller.userId;
}

// GET /api/v1/students — [{ id, name, email }], oldest first.
export async function GET(request: Request): Promise<Response> {
  try {
    const parentId = requireParent(await requireApiUser(request));
    const students = await listStudents(parentId);
    return withCors(
      request,
      Response.json(students, { headers: { 'Cache-Control': 'no-store' } })
    );
  } catch (err) {
    return withCors(request, errorResponse(err, request));
  }
}

// POST /api/v1/students — { name, email, password } → 201 { id, name, email }.
// The same rules as the website's "Add a Student" form.
export async function POST(request: Request): Promise<Response> {
  try {
    const parentId = requireParent(await requireApiUser(request));
    const body = await readJsonObject(request);
    const ip = clientIp(request.headers);
    let student;
    try {
      student = await createStudent(parentId, body);
    } catch (err) {
      if (err instanceof ValidationError && err.fields?.email === 'That email is already in use.') {
        securityEvent('student.added', { surface: 'api', ip, userId: parentId, email: body.email, outcome: 'duplicate_email' });
      }
      throw err;
    }
    securityEvent('student.added', { surface: 'api', ip, userId: parentId, email: student.email, outcome: 'created' });
    return withCors(request, Response.json(student, { status: 201 }));
  } catch (err) {
    return withCors(request, errorResponse(err, request));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
