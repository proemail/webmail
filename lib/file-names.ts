/**
 * File-name helpers shared by the Files stores.
 */

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  // Text & code
  txt: 'text/plain',
  text: 'text/plain',
  log: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
  csv: 'text/csv',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  mjs: 'text/javascript',
  ts: 'text/plain',
  tsx: 'text/plain',
  jsx: 'text/plain',
  json: 'application/json',
  xml: 'application/xml',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  toml: 'application/toml',
  ini: 'text/plain',
  cfg: 'text/plain',
  conf: 'text/plain',
  env: 'text/plain',
  sql: 'application/sql',
  ics: 'text/calendar',
  vcf: 'text/vcard',
  eml: 'message/rfc822',
  rtf: 'application/rtf',
  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  // Audio & video
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  // Archives
  zip: 'application/zip',
  gz: 'application/gzip',
  tar: 'application/x-tar',
  '7z': 'application/x-7z-compressed',
};

function splitExtension(name: string): { base: string; ext: string } {
  const dotIdx = name.lastIndexOf('.');
  // A leading dot (".env") is part of the name, not an extension separator.
  if (dotIdx <= 0) return { base: name, ext: '' };
  return { base: name.substring(0, dotIdx), ext: name.substring(dotIdx) };
}

/**
 * Content type for a file created by name alone (no bytes to sniff). A name
 * without an extension is treated as plain text, since the file starts empty;
 * an extension we don't know maps to the generic binary type.
 */
export function contentTypeForFileName(name: string): string {
  const { ext } = splitExtension(name.trim());
  if (!ext) return 'text/plain';
  return EXTENSION_CONTENT_TYPES[ext.substring(1).toLowerCase()] ?? 'application/octet-stream';
}

/**
 * Name for a copy of `name` that doesn't collide with anything in `taken`.
 * Returns `name` unchanged when it is free; otherwise "name (copy).ext", then
 * "name (copy 2).ext", and so on.
 */
export function uniqueCopyName(name: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(name)) return name;

  const { base, ext } = splitExtension(name);
  for (let i = 1; ; i++) {
    const candidate = i === 1 ? `${base} (copy)${ext}` : `${base} (copy ${i})${ext}`;
    if (!used.has(candidate)) return candidate;
  }
}
