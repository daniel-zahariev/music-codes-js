import { BoundaryError, ParseError } from './errors.js';
import type { IterableCode } from './types.js';

export class ISRC implements IterableCode<ISRC> {
  /** Prefix to adhere to */
  public readonly prefix: string;

  /** Year */
  public readonly year: number;

  /** Code */
  public readonly code: number;

  constructor(prefix: string, year: number, code: number) {
    if (!/^([a-zA-Z]{2}[a-zA-Z0-9]{3})$/.test(prefix)) {
      throw new ParseError(`Invalid prefix: ${prefix}`);
    }
    if (year < 0 || year > 99) {
      throw new ParseError(`Invalid year: ${year}`);
    }
    if (code < 0 || code > 99999) {
      throw new ParseError(`Invalid code: ${code}`);
    }

    this.prefix = prefix.toUpperCase();
    this.year = year;
    this.code = code;
  }

  first() {
    return new ISRC(this.prefix, this.year, 0);
  }

  last() {
    return new ISRC(this.prefix, this.year, 99999);
  }

  previous() {
    if (this.code === 0) {
      throw new BoundaryError(`ISRC boundary reached: ${this.toString()}`);
    }
    return new ISRC(this.prefix, this.year, this.code - 1);
  }

  next() {
    if (this.code === 99999) {
      throw new BoundaryError(`ISRC boundary reached: ${this.toString()}`);
    }
    return new ISRC(this.prefix, this.year, this.code + 1);
  }

  *iterate(up = true): IterableIterator<ISRC> {
    let isrc: ISRC = this;

    while (true) {
      yield isrc;
      try {
        isrc = up ? isrc.next() : isrc.previous();
      } catch {
        break;
      }
    }
  }

  toString(): string {
    return `${this.prefix}${this.year.toString().padStart(2, '0')}${this.code.toString().padStart(5, '0')}`;
  }
}

export function parseISRC(isrc: string, prefix: string | undefined = undefined) {
  const parts = isrc.match(/^([a-zA-Z]{2}[a-zA-Z0-9]{3})([\d]{2})([\d]{5})$/i);
  if (!parts) {
    throw new ParseError(`Invalid ISRC: ${isrc}`);
  }
  if (prefix && parts[1] !== prefix) {
    throw new ParseError(`Invalid prefix '${prefix}' for '${isrc}'`);
  }

  const thePrefix = parts[1] ?? '';
  const year = Number.parseInt(parts[2] ?? '', 10);
  const code = Number.parseInt(parts[3] ?? '', 10);

  return new ISRC(thePrefix, year, code);
}
