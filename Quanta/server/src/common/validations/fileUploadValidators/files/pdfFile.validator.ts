export function isPdf(file: Buffer): boolean {
  return file.subarray(0, 4).toString('ascii') === '%PDF';
}