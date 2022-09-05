/**
 * Returns whether or not the given object contains no keys
 */
export function isEmpty(obj: any): boolean {
  return Object.keys(obj)?.length === 0;
}
