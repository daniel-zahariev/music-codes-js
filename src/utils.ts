import { CodeValidationError, InvalidStateError } from './errors.js';

/**
 * Naive implementation of Luhn algorithm for GTIN check digit
 * Does not check for valid code length
 * @see https://www.gs1.org/services/how-calculate-check-digit-manually
 * @see https://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers#JavaScript
 */
export function getLuhnCheckDigit(code: bigint | number | string) {
  const str = String(code);
  if (!/^\d+$/.test(str)) throw new CodeValidationError(`Invalid code: ${str}`);

  const cd =
    str
      .split('')
      .reverse()
      .reduce((acc, v, idx) => {
        return acc + (idx % 2 ? 1 : 3) * Number.parseInt(v);
      }, 0) % 10;
  return cd === 0 ? 0 : 10 - cd;
}

export function raise(message: string): never {
  throw new InvalidStateError(message);
}
