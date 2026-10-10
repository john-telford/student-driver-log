import { COMMON_PASSWORDS } from '@/lib/common-passwords';

const MIN_LENGTH = 8;
// bcrypt only hashes the first 72 bytes; anything past that is silently
// ignored, so a longer password would be weaker than it looks.
const MAX_BYTES = 72;
// Shorter name/email fragments ("al", "jo") would reject too many passwords.
const MIN_PERSONAL_PART = 3;

// The rule for a password being set (register, reset, parent adds a student).
// Returns the message to show, or null when the password is acceptable.
// Existing passwords are never re-checked; this runs only when one is set.
export function validatePassword(
  password: string,
  { name, email }: { name?: string; email?: string } = {}
): string | null {
  if (password.length < MIN_LENGTH) {
    return 'Password must be at least 8 characters.';
  }
  if (new TextEncoder().encode(password).length > MAX_BYTES) {
    return 'Password is too long. Use 72 characters or fewer (accented letters and emoji count as more than one).';
  }

  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    return 'That password is too common. Choose something harder to guess.';
  }

  const personal = [name ?? '', (email ?? '').split('@')[0]]
    .flatMap((s) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u))
    .filter((part) => part.length >= MIN_PERSONAL_PART);
  if (personal.some((part) => lower.includes(part))) {
    return "Password can't contain your name or email address.";
  }

  return null;
}
