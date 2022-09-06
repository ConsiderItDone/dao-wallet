export function createNewWallet() {
  return {
    accountId: generateAccountID(),
    privateKey: generateWalletPrivateKey(),
  };
}

// TODO: create unique account id
function generateAccountID(): string {
  return "polydev.testnet";
}

// TODO: use algorithm for generating new unique private key
function generateWalletPrivateKey(): string {
  return "jfmD4Jp7RhToz7w9kPR6";
}

export function shortenWalletAddress(
  address: string,
  startChars = 4,
  endChars = 4
): string {
  if (!address) return "";

  if (address.length <= 2 + startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars + 2)}...${address.substring(
    address.length - endChars
  )}`;
}
