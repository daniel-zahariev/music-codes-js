import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';
import { ISWC, parseISWC } from '../src/iswc.js';

describe('ISWC', () => {
  test('parse', () => {
    /// VALID
    const validDots = ['T-034.524.680-1', 'T-034.524.681-2'];
    for (const code of validDots) {
      const iswc = parseISWC(code);
      expect(iswc.toString()).toEqual(code);
    }
    const validNoDots = ['T-034524680-1', 'T-034524681-2'];
    for (const code of validNoDots) {
      const iswc = parseISWC(code);
      expect(iswc.toString(false)).toEqual(code);
    }

    /// INVALID
    expect(() => parseISWC('A-034.524.680-1')).toThrow('Invalid ISWC: A-034.524.680-1');
    expect(() => parseISWC('T-034.524.6800-1')).toThrow('Invalid ISWC: T-034.524.6800-1');
    expect(() => parseISWC('T-034.524.680-A')).toThrow('Invalid ISWC: T-034.524.680-A');
  });

  test('construct', () => {
    /// VALID
    expect(new ISWC('T', 34524680, 1).toString()).toEqual('T-034.524.680-1');
    expect(new ISWC('T', 34524680, 1).toString(false)).toEqual('T-034524680-1');
    expect(new ISWC('T', 1).toString(false)).toEqual('T-000000001-0');
    expect(new ISWC('T', 1e9 - 1).toString(false)).toEqual('T-999999999-4');

    /// INVALID
    expect(() => new ISWC('A', 34524680, -1).toString()).toThrow('Invalid work type: A');
    expect(() => new ISWC('T', 34524680, -1).toString()).toThrow('Invalid check digit: -1');
    expect(() => new ISWC('T', 34524680000, 1).toString()).toThrow('Invalid code: 34524680000');
    expect(() => new ISWC('T', 0, 1).toString()).toThrow('Invalid code: 0');
    expect(() => new ISWC('T', -1, 1).toString()).toThrow('Invalid code: -1');
  });

  test('valid codes should not throw', { repeats: 0 }, () => {
    const code = faker.number.int({ min: 1, max: 1e9 - 1 });
    expect(new ISWC('T', code).toString(false).substring(0, 11)).toEqual(`T-${code.toString().padStart(9, '0')}`);
  });

  // test('iterate up', () => {
  //   const isrc = new ISRC('USAWE', 24, 99000);
  //   const iterator = isrc.iterate();
  //   const codes = [];
  //   while (true) {
  //     const result = iterator.next();
  //     if (result.done) break;
  //     codes.push(result.value);
  //   }
  //   expect(codes.length).toEqual(1000);
  // });

  // test('iterate down', () => {
  //   const isrc = new ISRC('USAWE', 24, 1000);
  //   const iterator = isrc.iterate(false);
  //   const codes = [];
  //   while (true) {
  //     const result = iterator.next();
  //     if (result.done) break;
  //     codes.push(result.value);
  //   }
  //   expect(codes.length).toEqual(1001);
  //   expect(codes[codes.length - 1]?.toString()).toBe('USAWE2400000');
  // });
});
