/**
 * Generate a bid receipt object.
 */
export function generateReceipt(
  auctionAddress,
  auctionTitle,
  bidAmount,
  salt,
  commitHash,
  bidderAddress
) {
  return {
    version: "1",
    network: "Arc Testnet",
    chainId: 5042002,
    auctionAddress,
    auctionTitle,
    bidAmount: bidAmount.toString(),
    salt,
    commitHash,
    bidderAddress,
    timestamp: Date.now(),
    issuedAt: new Date().toISOString(),
  };
}

/**
 * Trigger a browser download of the receipt as a JSON file.
 */
export function downloadReceipt(receipt) {
  const json = JSON.stringify(receipt, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const ts = Math.floor(receipt.timestamp / 1000);
  const filename = `sealbid-receipt-${receipt.auctionAddress.slice(0, 8)}-${ts}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate an uploaded bid receipt JSON file.
 * @param {File} file
 * @returns {Promise<object>}
 */
export function parseReceiptFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const required = ["auctionAddress", "bidAmount", "salt", "commitHash", "bidderAddress"];
        for (const field of required) {
          if (!parsed[field]) {
            reject(new Error(`Invalid receipt: missing field "${field}"`));
            return;
          }
        }
        resolve(parsed);
      } catch {
        reject(new Error("Invalid JSON file. Please upload a valid bid receipt."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}
