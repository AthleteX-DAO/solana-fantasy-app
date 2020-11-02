import { PublicKey } from '@solana/web3.js';
import { strictEqual } from 'assert';
import BN from 'bn.js';
export const BufferLayout = require('buffer-layout');

/**
 * Layout for a public key
 */
export const publicKey = (property: string = 'publicKey'): Object => {
  const layout = BufferLayout.blob(32, property);
  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (...args: any) => {
    const data = _decode(...args);
    return new PublicKey(data);
  };

  layout.encode = (value: PublicKey, ...args: any) => {
    return _encode(value.toBuffer(), ...args);
  };

  return layout;
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property: string = 'uint64'): Object => {
  const layout = BufferLayout.blob(8, property);
  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (...args: any) => {
    const data = _decode(...args);
    return u64.fromBuffer(data);
  };

  layout.encode = (value: u64 | number, ...args: any) => {
    return _encode(new u64(value).toBuffer(), ...args);
  };

  return layout;
};

/**
 * Layout for a Rust String type
 */
export const rustString = (property: string = 'string'): Object => {
  const layout = BufferLayout.struct(
    [
      BufferLayout.u32('length'),
      BufferLayout.u32('lengthPadding'),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), 'chars'),
    ],
    property
  );
  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (...args: any) => {
    const data = _decode(...args);
    return data.chars.toString('utf8');
  };

  layout.encode = (value: string, ...args: any) => {
    const data = {
      chars: Buffer.from(value, 'utf8'),
    };
    return _encode(data, ...args);
  };

  return layout;
};

/**
 * Layout for a Rust String type
 */
export const utf16FixedString = (
  maxSymbols: number,
  property: string = 'utf16FixedString'
): Object => {
  const layout = BufferLayout.seq(BufferLayout.u16(), maxSymbols, property);
  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (...args: any) => {
    const data = _decode(...args);
    return String.fromCharCode(...data.filter((x: number) => x !== 0));
  };

  layout.encode = (value: string, ...args: any) => {
    if (value.length > maxSymbols) throw new Error('String is too big');
    const data = value
      .padEnd(maxSymbols, '\0')
      .split('')
      .map((x) => x.charCodeAt(0));
    return _encode(data, ...args);
  };

  return layout;
};

export const boolean = (property: string = 'boolean'): Object => {
  const layout = BufferLayout.u8(property);
  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (...args: any) => {
    const data = _decode(...args);
    switch (data) {
      case 1:
        return true;
      case 0:
        return false;
      default:
        throw new Error('Invalid value for bool');
    }
  };

  layout.encode = (value: boolean, ...args: any) => {
    return _encode(value ? 1 : 0, ...args);
  };

  return layout;
};

/**
 * 64-bit value
 */
export class u64 extends BN {
  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
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
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(''),
      16
    );
  }
}
