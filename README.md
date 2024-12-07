# Music Codes
This is a small library for parsing and iterating over music codes - ISRC, ISWC, UPC, EAN, and more (GTIN).

## INSTALL
```bash
npm install music-codes
```

## USAGE

### ISRC
```typescript
import { ISRC, parseISRC } from 'music-codes';

// instantiate
const isrc = new ISRC('USAT2', 7, 3859);
console.log(isrc.toString());
/// USAT20703859

// or parse
const parsedIsrc: ISRC = parseISRC('USAT29900609');
console.log(parsedIsrc);
/// ISRC { prefix: 'USAT2', year: 99, code: 609 }
console.log(parsedIsrc.toString());
/// USAT29900609

```

### ISWC
```typescript
import { ISWC, parseISWC } from 'music-codes';

// instantiate
const iswc = new ISWC('T', 1, 0);
console.log(iswc.toString());
/// T-000.000.001-0

const parsedIswc: ISWC = parseISWC('T-070.080.286-3');
console.log(parsedIswc);
/// ISWC { workType: 'T', code: 70080286, check: 3 }
console.log(parsedIswc.toString());
/// T-070.080.286-3

```


### UPC
```typescript
import { getUpcFromPrefix, GTIN, parseUPC } from 'music-codes';

// parse
const upc: GTIN = parseUPC('603497845125');
// UPC is a GTIN fixed at length of 12 digits
console.log(upc.toString());
/// 603497845125

// the allowed set of codes can be limited to a prefix
// the prefix here is 8 digits which leaves us with 3 digits to play with 
// as the last digit is the check digit
const prefixedUpc: GTIN = getUpcFromPrefix('60349784');
console.log(prefixedUpc);
/// GTIN { length: 12, code: 60349784000n, check: 7, prefix: '60349784' }
console.log(prefixedUpc.toString());
/// 603497840007

```

### EAN
```typescript
import { getEanFromPrefix, GTIN, parseEAN } from 'music-codes';

// parse
const upc: GTIN = parseEAN('603497845125');
// EAN is a GTIN fixed at length of 13 digits
console.log(upc.toString());
/// 603497845125

// the allowed set of codes can be limited to a prefix
// the prefix here is 9 digits which leaves us with 3 digits 
// to play with as the last digit is the check digit
const prefixedEan: GTIN = getEanFromPrefix('603497841');
console.log(prefixedEan);
/// GTIN { length: 13, code: 603497841000n, check: 8, prefix: '603497841' }
console.log(prefixedEan.toString());
/// 6034978410008

```

### IterableCode Interface
All codes implement the `IterableCode` interface which allows for iteration over the codes in a range that is in some cases limited via prefix.

```typescript
import { ISRC } from 'music-codes';

// for ISRCs the range is limited to 100_000 codes per year
const isrc = new ISRC('USAT2', 7, 3859);
console.log(isrc.previous().toString()); /// USAT20703858
console.log(isrc.next().toString()); /// USAT20703860
console.log(isrc.first().toString()); /// USAT20700000
console.log(isrc.last().toString()); /// USAT20799999

const isrcs = []
const iterator = isrc.iterate()
for(let i = 0; i < 10; i++) {
    isrcs.push(iterator.next().value.toString());
}
console.log(isrcs);
/// [ 'USAT20703859', 'USAT20703860', 'USAT20703861', 
///   'USAT20703862', 'USAT20703863',  'USAT20703864', 
///   'USAT20703865', 'USAT20703866', 'USAT20703867', 
///   'USAT20703868' ]
```