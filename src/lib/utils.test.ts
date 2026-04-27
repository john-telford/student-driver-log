import { describe, it, expect } from 'vitest';
import { formatHMM } from './utils';

describe('formatHMM', () => {
  it('formats 90 minutes as 1:30', () => {
    expect(formatHMM(90)).toBe('1:30');
  });

  it('formats 0 minutes as 0:00', () => {
    expect(formatHMM(0)).toBe('0:00');
  });

  it('formats 60 minutes as 1:00', () => {
    expect(formatHMM(60)).toBe('1:00');
  });

  it('formats 3000 minutes as 50:00', () => {
    expect(formatHMM(3000)).toBe('50:00');
  });

  it('pads single-digit minutes with leading zero', () => {
    expect(formatHMM(61)).toBe('1:01');
  });

  it('clamps negative input to 0:00', () => {
    expect(formatHMM(-90)).toBe('0:00');
  });

  it('truncates fractional minutes', () => {
    expect(formatHMM(90.9)).toBe('1:30');
  });
});
