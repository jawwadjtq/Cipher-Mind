/**
 * Digital Encodings & Representations
 * Base64, Base64URL, Hexadecimal, Binary, URL Percent-Encoding, HTML Entities, Decimal ASCII, Unicode Escapes
 */

// UTF-8 safe Base64 decode
export function base64Decode(input: string): string {
  const clean = input.trim().replace(/\s+/g, '');
  // Base64URL conversion to standard Base64
  let b64 = clean.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }

  // Verify valid base64 character set
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) {
    throw new Error('Invalid Base64 characters detected.');
  }

  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Try decoding as UTF-8; fallback to latin1 if invalid utf-8
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(bytes);
  } catch {
    return binaryString;
  }
}

// UTF-8 safe Base64 encode
export function base64Encode(input: string, isUrlSafe = false): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  let binaryString = '';
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  let b64 = btoa(binaryString);
  if (isUrlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return b64;
}

// Hexadecimal decode
export function hexDecode(input: string): string {
  // Strip 0x, spaces, colons, dashes
  const clean = input.replace(/0x/gi, '').replace(/[\s:-]/g, '');
  if (clean.length === 0 || clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error('Invalid hexadecimal string.');
  }

  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }

  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(bytes);
  } catch {
    let s = '';
    for (let i = 0; i < bytes.length; i++) {
      s += String.fromCharCode(bytes[i]);
    }
    return s;
  }
}

// Hexadecimal encode
export function hexEncode(input: string, delimiter = ' '): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  const hexParts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    hexParts.push(bytes[i].toString(16).padStart(2, '0'));
  }
  return hexParts.join(delimiter);
}

// Binary decode
export function binaryDecode(input: string): string {
  const clean = input.replace(/[^01]/g, '');
  if (clean.length === 0 || clean.length % 8 !== 0) {
    throw new Error('Binary input length must be a multiple of 8 bits.');
  }

  const bytes = new Uint8Array(clean.length / 8);
  for (let i = 0; i < clean.length; i += 8) {
    bytes[i / 8] = parseInt(clean.substring(i, i + 8), 2);
  }

  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(bytes);
  } catch {
    let s = '';
    for (let i = 0; i < bytes.length; i++) {
      s += String.fromCharCode(bytes[i]);
    }
    return s;
  }
}

// Binary encode
export function binaryEncode(input: string, delimiter = ' '): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    parts.push(bytes[i].toString(2).padStart(8, '0'));
  }
  return parts.join(delimiter);
}

// URL percent decode
export function urlDecode(input: string): string {
  if (!/%[0-9a-fA-F]{2}/.test(input) && !input.includes('+')) {
    throw new Error('No URL percent encoding detected.');
  }
  return decodeURIComponent(input.replace(/\+/g, ' '));
}

// URL percent encode
export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

// HTML entities decode
export function htmlEntitiesDecode(input: string): string {
  if (!/&[#a-zA-Z0-9]+;/.test(input)) {
    throw new Error('No HTML entities detected.');
  }
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

// Decimal ASCII codes decode: e.g. "72 101 108 108 111"
export function decimalAsciiDecode(input: string): string {
  const tokens = input.trim().split(/[\s,]+/);
  if (tokens.length < 2) {
    throw new Error('Not enough decimal ASCII tokens.');
  }

  let result = '';
  for (const token of tokens) {
    const num = parseInt(token, 10);
    if (isNaN(num) || num < 0 || num > 65535) {
      throw new Error(`Invalid ASCII decimal code: ${token}`);
    }
    result += String.fromCharCode(num);
  }
  return result;
}

// Decimal ASCII encode
export function decimalAsciiEncode(input: string, delimiter = ' '): string {
  const codes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    codes.push(input.charCodeAt(i));
  }
  return codes.join(delimiter);
}

// Unicode escapes decode: e.g. "\u0048\u0065\u006c\u006c\u006f"
export function unicodeEscapeDecode(input: string): string {
  if (!/\\u[0-9a-fA-F]{4}/.test(input)) {
    throw new Error('No Unicode escape sequences detected.');
  }
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

// Heuristics to check whether an input looks like an encoding
export function isLikelyBase64(input: string): boolean {
  const clean = input.trim().replace(/\s+/g, '');
  if (clean.length < 4 || clean.length % 4 !== 0) return false;
  // Must match standard or URL-safe base64
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(clean)) return false;
  // If it's pure standard English words, don't misclassify
  if (/^[A-Za-z\s]+$/.test(input) && input.split(' ').length > 2) return false;
  return true;
}

export function isLikelyHex(input: string): boolean {
  const clean = input.replace(/0x/gi, '').replace(/[\s:-]/g, '');
  if (clean.length < 4 || clean.length % 2 !== 0) return false;
  return /^[0-9a-fA-F]+$/.test(clean);
}

export function isLikelyBinary(input: string): boolean {
  const clean = input.replace(/[\s]/g, '');
  if (clean.length < 8 || clean.length % 8 !== 0) return false;
  return /^[01]+$/.test(clean);
}

export function isLikelyDecimalAscii(input: string): boolean {
  const trimmed = input.trim();
  const tokens = trimmed.split(/[\s,]+/);
  if (tokens.length < 3) return false;
  return tokens.every((t) => /^\d{1,5}$/.test(t) && parseInt(t, 10) >= 10 && parseInt(t, 10) <= 255);
}
