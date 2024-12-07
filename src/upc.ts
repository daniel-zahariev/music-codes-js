import { ParseError } from './errors.js';
import { GTIN } from './gtin.js';
import { getLuhnCheckDigit } from './utils.js';

/**
 * UPC is an alias for GTIN-12
 * @returns GTIN instance
 */
export function parseUPC(upc: string, prefix?: string) {
  if (!/^[\d]{12}$/.test(upc)) {
    throw new ParseError(`Invalid UPC: ${upc}`);
  }
  return new GTIN(upc, prefix, true);
}

/**
 * UPC is an alias for GTIN-12
 * @returns GTIN instance
 */
export function getUpcFromPrefix(prefix: string) {
  if (prefix.length < 1) {
    throw new ParseError(`Prefix is too short: ${prefix}`);
  }
  if (prefix.length > 11) {
    throw new ParseError(`Prefix is too long: ${prefix}`);
  }

  const code = prefix.padEnd(11, '0');
  const checkDigit = getLuhnCheckDigit(code);
  return new GTIN(`${code}${checkDigit}`, prefix, false);
}
