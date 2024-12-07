import { describe, expect, test } from 'vitest';
import { ISRC, parseISRC } from '../src/isrc.js';

describe('ISRC', () => {
  test('parse', () => {
    const valid = ['USAWE2400000', 'USAWE2400001', 'USAWE2499999', 'USA1E0000000', 'USA1E9999999'];
    for (const code of valid) {
      const isrc = parseISRC(code);
      expect(isrc.toString()).toEqual(code);
    }

    const invalid = [
      'U1AWE2400001', // digit in first two characters
      'USAWE240001', // shorter
      'USAWE24000001', // longer
      'U1AWE2A00001', // alpha char in year
      'U1AWE24A0001', // alpha char in code
    ];
    for (const code of invalid) {
      expect(() => parseISRC(code)).toThrow(`Invalid ISRC: ${code}`);
    }

    /// PREFIX
    // valid
    const isrc = parseISRC('USAWE2400001', 'USAWE');
    expect(isrc.toString()).toEqual('USAWE2400001');
    // invalid
    expect(() => parseISRC('USAWE2400001', 'US')).toThrow(`Invalid prefix 'US' for 'USAWE2400001'`);
    expect(() => parseISRC('USAWE2400001', 'USAWE2')).toThrow(`Invalid prefix 'USAWE2' for 'USAWE2400001'`);
  });

  test('construct', () => {
    // valid
    expect(new ISRC('USAWE', 24, 1).toString()).toEqual('USAWE2400001');
    expect(new ISRC('USA1E', 24, 1).toString()).toEqual('USA1E2400001');
    expect(new ISRC('USAWE', 0, 1).toString()).toEqual('USAWE0000001');
    expect(new ISRC('USAWE', 0, 99999).toString()).toEqual('USAWE0099999');

    // invalid
    expect(() => new ISRC('USAW', 24, 1)).toThrow('Invalid prefix: USAW');
    expect(() => new ISRC('USAWE1', 24, 1)).toThrow('Invalid prefix: USAWE1');
    expect(() => new ISRC('USAWE', -1, 1)).toThrow('Invalid year: -1');
    expect(() => new ISRC('USAWE', 100, 1)).toThrow('Invalid year: 100');
    expect(() => new ISRC('USAWE', 24, -1)).toThrow('Invalid code: -1');
    expect(() => new ISRC('USAWE', 24, 100000)).toThrow('Invalid code: 100000');
  });

  test('iterate up', () => {
    const isrc = new ISRC('USAWE', 24, 99000);
    const iterator = isrc.iterate();
    const codes = [];
    while (true) {
      const result = iterator.next();
      if (result.done) break;
      codes.push(result.value);
    }
    expect(codes.length).toEqual(1000);
  });

  test('iterate down', () => {
    const isrc = new ISRC('USAWE', 24, 1000);
    const iterator = isrc.iterate(false);
    const codes = [];
    while (true) {
      const result = iterator.next();
      if (result.done) break;
      codes.push(result.value);
    }
    expect(codes.length).toEqual(1001);
    expect(codes[codes.length - 1]?.toString()).toBe('USAWE2400000');
  });
});
