import { describe, it, expect } from 'vitest';
import { checkWindZoneCompliance } from '../windZone';

describe('checkWindZoneCompliance', () => {
  it('passes when home zone matches county zone', () => {
    const result = checkWindZoneCompliance('II', 'II', 'Alachua');
    expect(result.status).toBe('pass');
  });

  it('passes when home zone exceeds county requirement', () => {
    const result = checkWindZoneCompliance('III', 'II', 'Alachua');
    expect(result.status).toBe('pass');
  });

  it('fails when Zone I home is in Zone II county', () => {
    const result = checkWindZoneCompliance('I', 'II', 'Alachua');
    expect(result.status).toBe('fail');
    expect(result.message).toContain('Zone I');
    expect(result.message).toContain('Zone II');
  });

  it('fails when Zone I home is in Zone III county', () => {
    const result = checkWindZoneCompliance('I', 'III', 'Miami-Dade');
    expect(result.status).toBe('fail');
  });

  it('fails when Zone II home is placed in Zone III county', () => {
    const result = checkWindZoneCompliance('II', 'III', 'Miami-Dade');
    expect(result.status).toBe('fail');
    expect(result.category).toBe('wind-zone');
  });

  it('passes when Zone III home is in any county', () => {
    for (const zone of ['I', 'II', 'III'] as const) {
      expect(checkWindZoneCompliance('III', zone, 'Test County').status).toBe('pass');
    }
  });
});
