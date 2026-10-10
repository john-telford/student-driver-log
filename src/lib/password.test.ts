import { describe, it, expect } from 'vitest';
import { validatePassword } from './password';
import { COMMON_PASSWORDS } from './common-passwords';

const OK = 'gravel-lantern-42';

describe('validatePassword', () => {
  it('accepts a long, uncommon, impersonal password', () => {
    expect(validatePassword(OK, { name: 'Jimmy Telford', email: 'jimmy@example.com' })).toBeNull();
  });

  it('requires at least 8 characters', () => {
    expect(validatePassword('')).toBe('Password must be at least 8 characters.');
    expect(validatePassword('k7#vQ2m')).toBe('Password must be at least 8 characters.');
    expect(validatePassword('k7#vQ2mz')).toBeNull();
  });

  it('caps the password at 72 bytes, the most bcrypt hashes', () => {
    expect(validatePassword('k7#vQ2mz'.repeat(9))).toBeNull(); // 72 bytes
    expect(validatePassword(`${'k7#vQ2mz'.repeat(9)}x`)).toMatch(/too long\. Use 72 characters or fewer/);
  });

  it('counts bytes, not characters, toward the cap', () => {
    // 'é' is 2 bytes in UTF-8; 36 of them are 36 characters but 72 bytes.
    expect(validatePassword('é'.repeat(36))).toBeNull();
    expect(validatePassword('é'.repeat(37))).toMatch(/too long/);
    // 19 emoji: 38 UTF-16 units, 76 bytes.
    expect(validatePassword('🚗'.repeat(19))).toMatch(/too long/);
  });

  it('rejects common passwords regardless of case', () => {
    const message = 'That password is too common. Choose something harder to guess.';
    expect(validatePassword('password')).toBe(message);
    expect(validatePassword('PassWord')).toBe(message);
    expect(validatePassword('QWERTYUIOP')).toBe(message);
    expect(validatePassword('trustno1')).toBe(message);
  });

  it('ships a lowercased list of only 8+ character entries', () => {
    expect(COMMON_PASSWORDS.size).toBeGreaterThan(150);
    for (const p of COMMON_PASSWORDS) {
      expect(p.length).toBeGreaterThanOrEqual(8);
      expect(p).toBe(p.toLowerCase());
    }
  });

  it("rejects a password containing the user's name, any case", () => {
    const message = "Password can't contain your name or email address.";
    expect(validatePassword('JimmysCar2026', { name: 'Jimmy Telford' })).toBe(message);
    expect(validatePassword('river-TELFORD-9', { name: 'Jimmy Telford' })).toBe(message);
  });

  it("rejects a password containing the email's local part or its pieces", () => {
    const message = "Password can't contain your name or email address.";
    expect(validatePassword('xx-jtelford-xx', { email: 'jtelford@example.com' })).toBe(message);
    expect(validatePassword('hello-driver-9', { email: 'new.driver@example.com' })).toBe(message);
  });

  it('ignores name and email pieces shorter than 3 characters', () => {
    expect(validatePassword('Al-is-driving-9', { name: 'Al Wu', email: 'al.wu@example.com' })).toBeNull();
  });

  it("ignores the email's domain", () => {
    expect(validatePassword('example-river-9', { email: 'jt@example.com' })).toBeNull();
  });
});
