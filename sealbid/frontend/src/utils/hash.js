import { ethers } from "ethers";

/**
 * Generate a cryptographically random salt.
 * @returns {string} 32-byte hex string (0x prefixed)
 */
export function generateSalt() {
  return ethers.hexlify(ethers.randomBytes(32));
}

/**
 * Compute the commitment hash.
 * Must exactly match SealBidAuction.sol:
 *   keccak256(abi.encodePacked(bidAmount, salt, bidderAddress, auctionAddress))
 *
 * @param {bigint|string} bidAmount - Raw USDC units (6 decimals)
 * @param {string} salt - 32-byte hex string
 * @param {string} bidderAddress - The bidder's wallet address
 * @param {string} auctionAddress - The auction contract address
 * @returns {string} bytes32 hash (0x prefixed)
 */
export function computeCommitHash(bidAmount, salt, bidderAddress, auctionAddress) {
  return ethers.solidityPackedKeccak256(
    ["uint256", "bytes32", "address", "address"],
    [BigInt(bidAmount), salt, bidderAddress, auctionAddress]
  );
}

/**
 * Verify a bid receipt against the on-chain stored commitment hash.
 *
 * @param {object} receipt - The parsed bid receipt
 * @param {string} onChainHash - The stored commitHash from the contract
 * @param {string} bidderAddress - The current wallet address
 * @param {string} auctionAddress - The auction contract address
 * @returns {{ valid: boolean, computedHash: string }}
 */
export function verifyReceipt(receipt, onChainHash, bidderAddress, auctionAddress) {
  try {
    const computedHash = computeCommitHash(
      receipt.bidAmount,
      receipt.salt,
      bidderAddress,
      auctionAddress
    );
    const valid = computedHash.toLowerCase() === onChainHash.toLowerCase();
    return { valid, computedHash };
  } catch {
    return { valid: false, computedHash: "" };
  }
}
