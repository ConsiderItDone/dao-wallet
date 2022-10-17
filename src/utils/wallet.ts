export function shortenWalletAddress(
  address: string,
  startChars = 4,
  endChars = 4
): string {
  if (!address) return "";

  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars)}...${address.substring(
    address.length - endChars
  )}`;
}
