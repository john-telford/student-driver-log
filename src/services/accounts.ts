import bcrypt from 'bcryptjs';
import { and, eq, inArray, or } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens, trips, users, type UserType } from '@/db/schema';
import { validatePassword } from '@/lib/password';
import { NotFoundError, ValidationError } from './errors';

// Account lifecycle shared by the web (Server Actions) and the native client
// (/api/v1): registering a parent, a parent adding a student, listing a
// parent's students, and deleting an account. Each surface keeps its own
// transport (form state vs HTTP) and its own security events; the rules live
// here once so the two can't drift (App Review 2026-10-29: the iOS app must
// register, add students and delete accounts in-app, not hand off to the web).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AccountInput = { name?: unknown; email?: unknown; password?: unknown };

export type CreatedAccount = {
  id: number;
  name: string;
  email: string;
  userType: UserType;
  parentId: number | null;
};

export type StudentSummary = { id: number; name: string; email: string };

function normalize(input: AccountInput) {
  return {
    name: typeof input.name === 'string' ? input.name.trim() : '',
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
    password: typeof input.password === 'string' ? input.password : '',
  };
}

// Registers a parent account (the only kind anyone can create for themselves).
// Throws ValidationError with per-field messages (a taken email included, as
// a 400 on `email`, so clients need no new error code). Messages match the web register form's.
export async function registerParent(input: AccountInput): Promise<CreatedAccount> {
  const { name, email, password } = normalize(input);
  const fields: Record<string, string> = {};
  if (!name) fields.name = 'Name is required.';
  if (!email || !EMAIL_RE.test(email)) fields.email = 'A valid email address is required.';
  const passwordError = validatePassword(password, { name, email });
  if (passwordError) fields.password = passwordError;
  if (Object.keys(fields).length > 0) {
    throw new ValidationError(Object.values(fields)[0], fields);
  }

  if (await emailTaken(email)) {
    throw new ValidationError('An account with that email already exists.', {
      email: 'An account with that email already exists.',
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [created] = await db
    .insert(users)
    .values({ email, passwordHash, name, userType: 'parent' })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      userType: users.userType,
      parentId: users.parentId,
    });
  return created;
}

// A parent adds a student account. The caller has already checked that
// `parentId` is a parent. Messages match the web "Add a Student" form's.
export async function createStudent(parentId: number, input: AccountInput): Promise<StudentSummary> {
  const { name, email, password } = normalize(input);
  if (!name) throw new ValidationError('Name is required.', { name: 'Name is required.' });
  if (!EMAIL_RE.test(email)) throw new ValidationError('Enter a valid email.', { email: 'Enter a valid email.' });
  const passwordError = validatePassword(password, { name, email, forStudent: true });
  if (passwordError) throw new ValidationError(passwordError, { password: passwordError });

  if (await emailTaken(email)) {
    throw new ValidationError('That email is already in use.', { email: 'That email is already in use.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash, userType: 'student', parentId })
    .returning({ id: users.id, name: users.name, email: users.email });
  return created;
}

// A parent's students, oldest first (the order the web selector shows).
export async function listStudents(parentId: number): Promise<StudentSummary[]> {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.parentId, parentId), eq(users.userType, 'student')))
    .orderBy(users.id);
}

// Throws NotFoundError unless `studentId` is a student of `parentId`. Not
// found rather than forbidden, so a parent can't probe for other families'
// student ids.
export async function assertParentOwnsStudent(parentId: number, studentId: number): Promise<void> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, studentId), eq(users.parentId, parentId), eq(users.userType, 'student')))
    .limit(1);
  if (!row) throw new NotFoundError('Student not found.');
}

// Permanently deletes an account and everything it owns:
// - a parent: the parent, every student account, every trip and reset token
//   in the family (what the website's Settings → Delete Account has always
//   done);
// - a student: the student, their trips and their reset tokens. The parent
//   account stays, and isn't notified (John, 2026-10-28).
//
// The ON DELETE CASCADE foreign keys would remove the children on their own;
// deleting each table explicitly keeps the privacy policy's promise even if FK
// enforcement is ever off. A libsql batch runs as one transaction (BEGIN …
// COMMIT, rolled back on any error); db.transaction() is avoided because
// libsql opens a fresh connection afterwards, which empties a :memory: DB.
export async function deleteAccount(caller: { userId: number; userType: UserType }): Promise<void> {
  if (caller.userType === 'student') {
    const id = caller.userId;
    // Only a student row takes this path, so a mislabelled caller can't take
    // a parent's own trips and tokens with it.
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, id), eq(users.userType, 'student')))
      .limit(1);
    if (!row) throw new NotFoundError('Account not found.');
    await db.batch([
      db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, id)),
      db.delete(trips).where(or(eq(trips.studentId, id), eq(trips.createdBy, id))),
      db.delete(users).where(and(eq(users.id, id), eq(users.userType, 'student'))),
    ]);
    return;
  }

  const parentId = caller.userId;
  // Subqueries run per statement, so the children go before the students
  // they are found through.
  const studentIds = db.select({ id: users.id }).from(users).where(eq(users.parentId, parentId));
  const familyIds = db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.id, parentId), eq(users.parentId, parentId)));

  await db.batch([
    db.delete(passwordResetTokens).where(inArray(passwordResetTokens.userId, familyIds)),
    db.delete(trips).where(or(inArray(trips.studentId, familyIds), inArray(trips.createdBy, familyIds))),
    db.delete(users).where(inArray(users.id, studentIds)),
    db.delete(users).where(eq(users.id, parentId)),
  ]);
}

async function emailTaken(email: string): Promise<boolean> {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return Boolean(existing);
}
