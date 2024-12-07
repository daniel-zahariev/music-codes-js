import { describe, expect, test } from 'vitest';
import { getUpcFromPrefix, parseUPC } from '../src/upc.js';

describe('UPC', () => {
  test('parse', () => {
    const valid = [['602435002088', 'GTIN-12']];
    for (const [code, format] of valid) {
      const upc = parseUPC(code ?? '');
      expect(upc.toString()).toEqual(code);
      expect(upc.gtinFormat).toEqual(format);
    }

    //// INVALID
    expect(() => parseUPC('60243500208')).toThrow('Invalid UPC: 60243500208');
    expect(() => parseUPC('60243500208a')).toThrow('Invalid UPC: 60243500208a');
  });

  test('prefix', () => {
    const prefixedUpc = getUpcFromPrefix('60349784');
    expect(prefixedUpc.length).toEqual(12);
    expect(prefixedUpc.toString()).toEqual('603497840007');

    const iterator = prefixedUpc.iterate();
    const upcs = [];
    while (true) {
      const result = iterator.next();
      if (result.done) break;
      upcs.push(result.value);
    }
    expect(upcs.length).toEqual(1000);
  });
});
