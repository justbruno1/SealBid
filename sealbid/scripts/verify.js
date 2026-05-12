const hre = require("hardhat");

async function main() {
  const factoryAddress = process.env.FACTORY_ADDRESS;
  const usdcAddress = process.env.USDC_ADDRESS || "0x3600000000000000000000000000000000000000";

  if (!factoryAddress) {
    console.error("Please set FACTORY_ADDRESS environment variable");
    process.exit(1);
  }

  console.log("Verifying SealBidFactory at:", factoryAddress);

  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [usdcAddress],
    });
    console.log("Verification successful!");
  } catch (err) {
    if (err.message.includes("Already Verified")) {
      console.log("Contract is already verified.");
    } else {
      console.error("Verification failed:", err);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
