import { describe, expect, test } from 'vitest';
import { GTIN, getGtinFromPrefix } from '../src/gtin.js';
import { getLuhnCheckDigit } from '../src/utils.js';

describe('Gtin', () => {
  test('parse', () => {
    const valid = [
      ['602435002088', 'GTIN-12'],
      ['0602435002088', 'GTIN-13'],
      ['00602435002088', 'GTIN-14'],
      ['00000602435002088', 'GSIN'],
      ['000000602435002088', 'SSCC'],
    ];
    for (const [code, format] of valid) {
      const gtin = new GTIN(code ?? '');
      expect(gtin.toString()).toEqual(code);
      expect(gtin.gtinFormat).toEqual(format);
    }

    //// INVALID
    expect(() => new GTIN('60243500208')).toThrow('Unsupported GTIN length');
    expect(() => new GTIN('60243500208a')).toThrow('Invalid GTIN');
  });

  test('gtinFormat & realGtinFormat', () => {
    const upc = new GTIN('0602435002095');
    expect(upc.gtinFormat).toBe('GTIN-13');
    expect(upc.realGtinFormat).toBe('GTIN-12');
  });

  test('first & last', () => {
    const gtin = new GTIN('602435002095', '602435', true);
    expect(gtin.first().toString()).toBe('602435000008');
    expect(gtin.last().toString()).toBe('602435999999');
  });

  test('prev & next', () => {
    const gtin = new GTIN('602435002095');
    expect(gtin.previous().toString()).toEqual('602435002088');
    expect(gtin.next().toString()).toEqual('602435002101');
  });

  test('iterate', () => {
    //// PREFIX
    // prefix is 9 digits, => 12 - 9 - 1 (check digit) = 2 free digits => 100 codes
    const gtinPrefix = getGtinFromPrefix('602435002', 12);
    const allCodes = Array.from(gtinPrefix.iterate());
    expect(allCodes.length).toEqual(100);

    //// UP
    // when there is no prefix we can iterate over all GTIN codes so we need to limit
    const gtin = new GTIN('602435012094');
    const iteratorUp = gtin.iterate(true);
    const codesUp = [];
    for (let i = 0; i < 1001; i++) {
      const result = iteratorUp.next();
      codesUp.push(result.value);
      if (result.done) break;
    }
    expect(codesUp.length).toEqual(1001);
    expect(codesUp[codesUp.length - 1].toString()).toBe('602435022093');

    //// DOWN
    // we can also iterate in reverse
    const iteratorDown = gtin.iterate(false);
    const codesDown = [];
    for (let i = 0; i < 1001; i++) {
      const result = iteratorDown.next();
      codesDown.push(result.value);
      if (result.done) break;
    }
    expect(codesDown.length).toEqual(1001);
    expect(codesDown[codesDown.length - 1].toString()).toBe('602435002095');
  });

  test('overflow', () => {
    const prefix = '6024350020';

    const first = `${prefix}0`;
    const gtinFirst = new GTIN(`${first}${getLuhnCheckDigit(first)}`, prefix, true);
    expect(() => gtinFirst.previous()).toThrow(`GTIN prefix overflow: ${prefix}`);

    const firstGtin12 = new GTIN('100000000007');
    expect(() => firstGtin12.previous()).toThrow('GTIN boundary reached: 099999999990');

    const last = `${prefix}0`;
    const gtinLast = new GTIN(`${last}${getLuhnCheckDigit(last)}`, prefix, true);
    expect(() => gtinLast.previous()).toThrow(`GTIN prefix overflow: ${prefix}`);

    const lastGtin12 = new GTIN('999999999993');
    expect(() => lastGtin12.next()).toThrow('GTIN boundary reached: 1000000000009');
  });
});
