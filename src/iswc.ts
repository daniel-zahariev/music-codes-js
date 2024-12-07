import { BoundaryError, ParseError } from './errors.js';
import type { IterableCode } from './types.js';

export class ISWC implements IterableCode<ISWC> {
  /** Work type */
  public readonly workType: string;

  /** Code */
  public readonly code: number;

  /** Check digit */
  public readonly check: number;

  constructor(workType: string, code: number, check?: number) {
    if (workType !== 'T') {
      throw new ParseError(`Invalid work type: ${workType}`);
    }
    if (code < 1 || code >= 1e9) {
      throw new ParseError(`Invalid code: ${code}`);
    }

    const codeDigits = code.toString().padStart(9, '0').split('').map(Number);
    const checkDigit = (10 - (codeDigits.reduce((acc, x, idx) => acc + (idx + 1) * x, 1) % 10)) % 10;
    if (typeof check !== 'undefined' && check !== checkDigit) {
      throw new ParseError(`Invalid check digit: ${check}`);
    }

    this.workType = workType;
    this.code = code;
    this.check = checkDigit;
  }

  first() {
    return new ISWC(this.workType, 1);
  }

  last() {
    return new ISWC(this.workType, 1e9 - 1);
  }

  previous() {
    if (this.code === 0) {
      throw new BoundaryError(`ISWC boundary reached: ${this.toString()}`);
    }
    return new ISWC(this.workType, this.code - 1);
  }

  next() {
    if (this.code === 1e10 - 1) {
      throw new BoundaryError(`ISWC boundary reached: ${this.toString()}`);
    }
    return new ISWC(this.workType, this.code + 1);
  }

  *iterate(up = true): IterableIterator<ISWC> {
    let iswc: ISWC = this;

    while (true) {
      yield iswc;
      try {
        iswc = up ? iswc.next() : iswc.previous();
      } catch {
        break;
      }
    }
  }

  toString(withDots = true): string {
    let codeStr = this.code.toString().padStart(9, '0');
    if (withDots) codeStr = codeStr.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    return `${this.workType}-${codeStr}-${this.check}`;
  }
}

export function parseISWC(iswc: string) {
  const parts = iswc.match(/^(T)-(\d{3}).?(\d{3}).?(\d{3})-(\d)$/);
  if (!parts) {
    throw new ParseError(`Invalid ISWC: ${iswc}`);
  }

  const workType = parts[1] ?? '';
  const code = Number.parseInt(`${parts[2]}${parts[3]}${parts[4]}`, 10);
  const digit = Number.parseInt(parts[5] ?? '', 10);

  return new ISWC(workType, code, digit);
}
