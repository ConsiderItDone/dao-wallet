/**
 * Returns whether the given object contains no keys
 */
export function isEmpty(obj: any): boolean {
  return Object.keys(obj)?.length === 0;
}

/**
 * Returns number with fixed decimals after dot without rounding
 */
export function toFixedBottom(number: number, decimals: number): string {
  let numberStr = number.toString();

  let dotIndex = numberStr.indexOf(".");
  if (dotIndex === -1) {
    if (!decimals) return numberStr;
    numberStr += ".";
    dotIndex = numberStr.indexOf(".");
  }

  if (!decimals) return numberStr.substring(0, dotIndex);

  return numberStr.substring(0, dotIndex + decimals + 1);
}
