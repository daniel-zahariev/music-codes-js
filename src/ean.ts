import { ParseError } from './errors.js';
import { GTIN } from './gtin.js';
import { getLuhnCheckDigit } from './utils.js';

/**
 * EAN is an alias for GTIN-13
 * @returns GTIN instance
 */
export function parseEAN(ean: string, prefix?: string) {
  if (!/^[\d]{13}$/.test(ean)) {
    throw new ParseError(`Invalid EAN: ${ean}`);
  }
  return new GTIN(ean, prefix, true);
}

/**
 * EAN is an alias for GTIN-13
 * @returns GTIN instance
 */
export function getEanFromPrefix(prefix: string) {
  if (prefix.length < 1) {
    throw new ParseError(`Prefix is too short: ${prefix}`);
  }
  if (prefix.length > 12) {
    throw new ParseError(`Prefix is too long: ${prefix}`);
  }

  const code = prefix.padEnd(12, '0');
  const checkDigit = getLuhnCheckDigit(code);
  return new GTIN(`${code}${checkDigit}`, prefix, false);
}
