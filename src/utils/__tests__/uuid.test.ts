import { describe, it, expect } from 'vitest';
import { generateUUID } from '../uuid';

describe('generateUUID', () => {
  it('generates valid RFC 4122 v4 UUID format', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  it('generates unique UUIDs consecutively', () => {
    const uuids = new Set(Array.from({ length: 50 }, () => generateUUID()));
    expect(uuids.size).toBe(50);
  });
});
