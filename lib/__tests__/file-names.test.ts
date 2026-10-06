import { describe, it, expect } from 'vitest';
import { contentTypeForFileName, uniqueCopyName } from '../file-names';

describe('uniqueCopyName', () => {
  it('keeps a name that is free', () => {
    expect(uniqueCopyName('a.txt', ['b.txt'])).toBe('a.txt');
  });

  it('adds "(copy)" before the extension when the name is taken', () => {
    expect(uniqueCopyName('a.txt', ['a.txt'])).toBe('a (copy).txt');
  });

  it('numbers further copies', () => {
    expect(uniqueCopyName('a.txt', ['a.txt', 'a (copy).txt'])).toBe('a (copy 2).txt');
    expect(uniqueCopyName('a.txt', ['a.txt', 'a (copy).txt', 'a (copy 2).txt'])).toBe('a (copy 3).txt');
  });

  it('handles names without an extension and dotfiles', () => {
    expect(uniqueCopyName('README', ['README'])).toBe('README (copy)');
    expect(uniqueCopyName('.env', ['.env'])).toBe('.env (copy)');
  });

  it('treats names that differ only by case as different, like the server', () => {
    expect(uniqueCopyName('a.txt', ['A.TXT'])).toBe('a.txt');
  });
});

describe('contentTypeForFileName', () => {
  it('maps known extensions, case-insensitively', () => {
    expect(contentTypeForFileName('report.pdf')).toBe('application/pdf');
    expect(contentTypeForFileName('photo.JPG')).toBe('image/jpeg');
    expect(contentTypeForFileName('notes.md')).toBe('text/markdown');
  });

  it('treats a name without an extension as plain text', () => {
    expect(contentTypeForFileName('notes')).toBe('text/plain');
    expect(contentTypeForFileName('.env')).toBe('text/plain');
  });

  it('falls back to the generic binary type for unknown extensions', () => {
    expect(contentTypeForFileName('data.xyz')).toBe('application/octet-stream');
  });
});
