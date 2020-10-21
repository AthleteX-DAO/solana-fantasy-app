import { strictEqual } from 'assert';
import BN from 'bn.js';
export const BufferLayout = require('buffer-layout');

/**
 * Layout for a public key
 */
export const publicKey = (property: string = 'publicKey'): Object => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property: string = 'uint64'): Object => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a Rust String type
 */
export const rustString = (property: string = 'string'): Object => {
  const rsl = BufferLayout.struct(
    [
      BufferLayout.u32('length'),
      BufferLayout.u32('lengthPadding'),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), 'chars'),
    ],
    property,
  );
  const _decode = rsl.decode.bind(rsl);
  const _encode = rsl.encode.bind(rsl);

  rsl.decode = (buffer, offset) => {
    const data = _decode(buffer, offset);
    return data.chars.toString('utf8');
  };

  rsl.encode = (str, buffer, offset) => {
    const data = {
      chars: Buffer.from(str, 'utf8'),
    };
    return _encode(data, buffer, offset);
  };

  return rsl;
};

/**
 * 64-bit value
 */
export class u64 extends BN {
  /**
   * Convert to Buffer representation
   */
  toBuffer():  Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 8) {
      return b;
    }
    strictEqual(b.length < 8, true, 'u64 too large');

    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    return zeroPad;
  }

  /**
   * Construct a u64 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): u64 {
    strictEqual(buffer.length === 8, true, `Invalid buffer length: ${buffer.length}`);
    return new BN(
      [...(buffer as any)]
        .reverse()
        .map(i => `00${i.toString(16)}`.slice(-2))
        .join(''),
      16,
    );
  }
}