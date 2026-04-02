import { describe, it, expect } from 'vitest';
import { checkFloodZoneCompliance } from '../floodZone';

describe('checkFloodZoneCompliance', () => {
  it('passes for Zone X with no elevation cert', () => {
    const result = checkFloodZoneCompliance('X', false);
    expect(result.status).toBe('pass');
  });

  it('fails for Zone AE without elevation cert', () => {
    const result = checkFloodZoneCompliance('AE', false);
    expect(result.status).toBe('fail');
  });

  it('passes for Zone AE with elevation cert', () => {
    const result = checkFloodZoneCompliance('AE', true);
    expect(result.status).toBe('pass');
  });

  it('fails for Zone VE without elevation cert', () => {
    const result = checkFloodZoneCompliance('VE', false);
    expect(result.status).toBe('fail');
  });

  it('gives warning for Zone VE even with elevation cert', () => {
    const result = checkFloodZoneCompliance('VE', true);
    expect(result.status).toBe('warning');
    expect(result.message).toContain('VE');
  });

  it('handles Zone A like Zone AE', () => {
    expect(checkFloodZoneCompliance('A', false).status).toBe('fail');
    expect(checkFloodZoneCompliance('A', true).status).toBe('pass');
  });
});
