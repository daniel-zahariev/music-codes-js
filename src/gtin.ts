import { BoundaryError, ParseError } from './errors.js';
import type { IterableCode } from './types.js';
import { getLuhnCheckDigit, raise } from './utils.js';

export type GtinFormat = (typeof GtinFormats)[number];
export const GtinFormats = ['GTIN-8', 'GTIN-12', 'GTIN-13', 'GTIN-14', 'GSIN', 'SSCC'] as const;

export const GtinFormatToLength: Record<GtinFormat, number> = Object.freeze({
  'GTIN-8': 8,
  'GTIN-12': 12,
  'GTIN-13': 13,
  'GTIN-14': 14,
  GSIN: 17,
  SSCC: 18,
});

export const GtinLengthToFormat = Object.fromEntries(
  Object.entries(GtinFormatToLength).map(([f, l]) => [l, f]),
) as Record<number, GtinFormat>;

export class GTIN implements IterableCode<GTIN> {
  /** Code without check digit */
  public readonly code: bigint;
  /** Check digit */
  public readonly check: number;
  /** Length of the GTIN format */
  public readonly length: number;
  /** Prefix to adhere to */
  public readonly prefix: string | undefined;

  constructor(gtin: string, prefix: string | undefined = undefined, verify = true) {
    if (!/^\d+$/.test(gtin)) {
      throw new ParseError(`Invalid GTIN: ${gtin}`);
    }
    if (!GtinLengthToFormat[gtin.length]) {
      throw new ParseError(`Unsupported GTIN length: ${gtin.length}`);
    }
    if (prefix && !gtin.startsWith(prefix)) {
      throw new ParseError(`Invalid prefix '${prefix}' for '${gtin}'`);
    }

    this.length = gtin.length;
    this.code = BigInt(gtin.slice(0, -1));
    this.check = Number.parseInt(gtin.slice(-1), 10);
    this.prefix = prefix;

    if (verify && this.check !== getLuhnCheckDigit(this.code)) {
      throw new ParseError(`Invalid check digit: ${gtin}`);
    }
  }

  get gtinFormat(): string {
    return GtinLengthToFormat[this.length] ?? raise(`Unsupported GTIN length: ${this.length}`);
  }

  get realGtinFormat(): string {
    let trueLength = `${this.code}${this.check}`.length;
    while (trueLength < this.length) {
      const maybeFormat = GtinLengthToFormat[trueLength];
      if (maybeFormat) return maybeFormat;
      trueLength++;
    }

    return GtinLengthToFormat[this.length] ?? raise(`Unsupported GTIN length: ${this.length}`);
  }

  first(): GTIN {
    const code = (this.prefix ?? '1').padEnd(this.length - 1, '0');
    const checkDigit = getLuhnCheckDigit(code);
    return new GTIN(`${code}${checkDigit}`, this.prefix, false);
  }

  last(): GTIN {
    const code = (this.prefix ?? '9').padEnd(this.length - 1, '9');
    const checkDigit = getLuhnCheckDigit(code);
    return new GTIN(`${code}${checkDigit}`, this.prefix, false);
  }

  previous(): GTIN {
    const checkDigit = getLuhnCheckDigit(this.code - 1n);
    const prevCode = `${this.code - 1n}${checkDigit}`.padStart(this.length, '0');

    if (this.code === 1n || this.code === BigInt(10n ** BigInt(this.length - 2))) {
      throw new BoundaryError(`GTIN boundary reached: ${prevCode}`);
    }
    if (this.prefix && !prevCode.startsWith(this.prefix)) {
      throw new BoundaryError(`GTIN prefix overflow: ${this.prefix}`);
    }
    return new GTIN(prevCode, this.prefix, false);
  }

  next(): GTIN {
    const checkDigit = getLuhnCheckDigit(this.code + 1n);
    const nextCode = `${this.code + 1n}${checkDigit}`.padStart(this.length, '0');

    if (nextCode.length > this.length) {
      throw new BoundaryError(`GTIN boundary reached: ${nextCode}`);
    }
    if (this.prefix && !nextCode.startsWith(this.prefix)) {
      throw new BoundaryError(`GTIN prefix overflow: ${this.prefix}`);
    }
    return new GTIN(nextCode, this.prefix, false);
  }

  *iterate(up = true): IterableIterator<GTIN> {
    let gtin: GTIN = this;

    while (true) {
      yield gtin;
      try {
        gtin = up ? gtin.next() : gtin.previous();
      } catch {
        break;
      }
    }
  }

  toString(): string {
    return `${this.code}${this.check}`.padStart(this.length, '0');
  }
}

export function getGtinFromPrefix(prefix: string, length: number) {
  if (!GtinLengthToFormat[length]) {
    throw new ParseError(`Unsupported GTIN length: ${length}`);
  }

  if (prefix.length < 1) {
    throw new ParseError(`Prefix is too short: ${prefix}`);
  }
  if (prefix.length > length - 1) {
    throw new ParseError(`Prefix is too long: ${prefix}`);
  }

  const code = prefix.padEnd(length - 1, '0');
  const checkDigit = getLuhnCheckDigit(code);
  return new GTIN(`${code}${checkDigit}`, prefix, false);
}
