import { describe, expect, test } from 'vitest';
import { getEanFromPrefix, parseEAN } from '../src/ean.js';

describe('EAN', () => {
  test('parse', () => {
    const valid = [['6024350020840', 'GTIN-13']];
    for (const [code, format] of valid) {
      const upc = parseEAN(code ?? '');
      expect(upc.toString()).toEqual(code);
      expect(upc.gtinFormat).toEqual(format);
    }

    //// INVALID
    expect(() => parseEAN('602435002084')).toThrow('Invalid EAN: 60243500208');
    expect(() => parseEAN('60243500208a')).toThrow('Invalid EAN: 60243500208a');
  });

  test('prefix', () => {
    const prefixedEan = getEanFromPrefix('603497841');
    expect(prefixedEan.length).toEqual(13);
    expect(prefixedEan.toString()).toEqual('6034978410008');

    const iterator = prefixedEan.iterate();
    const eans = [];
    while (true) {
      const result = iterator.next();
      if (result.done) break;
      eans.push(result.value);
    }
    expect(eans.length).toEqual(1000);
  });
});
