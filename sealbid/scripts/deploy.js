const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatUnits(balance, 6), "USDC");

  // USDC address on Arc Testnet
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x3600000000000000000000000000000000000000";
  console.log("Using USDC address:", USDC_ADDRESS);

  // Deploy SealBidFactory
  const SealBidFactory = await hre.ethers.getContractFactory("SealBidFactory");
  console.log("Deploying SealBidFactory...");
  const factory = await SealBidFactory.deploy(USDC_ADDRESS);
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("SealBidFactory deployed to:", factoryAddress);
  console.log("\n─── Deployment Summary ─────────────────────────────────────");
  console.log("Network:         Arc Testnet");
  console.log("Chain ID:        5042002");
  console.log("Factory address:", factoryAddress);
  console.log("USDC address:   ", USDC_ADDRESS);
  console.log("Explorer:        https://testnet.arcscan.app/address/" + factoryAddress);
  console.log("\n─── Update your .env ────────────────────────────────────────");
  console.log(`VITE_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`VITE_USDC_ADDRESS=${USDC_ADDRESS}`);
  console.log(`VITE_ARC_RPC_URL=https://rpc.testnet.arc.network`);
  console.log(`VITE_CHAIN_ID=5042002`);
  console.log(`VITE_BLOCK_EXPLORER_URL=https://testnet.arcscan.app`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
