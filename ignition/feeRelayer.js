// Import the necessary Hardhat packages
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Get the deployer's address
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TokenRelayer contract
  const TokenRelayer = await ethers.getContractFactory("TokenRelayer");

  // Deploy the contract
  const tokenRelayer = await TokenRelayer.deploy();

  console.log("TokenRelayer contract deployed to:", tokenRelayer.address);

  // Optionally, set up roles (like the transfer executor role)
  const transferExecutorRole = await tokenRelayer.TRANSFER_EXECUTOR_ROLE();

  // Grant the transfer executor role to the deployer
  await tokenRelayer.grantRole(transferExecutorRole, deployer.address);

  console.log("Transfer Executor role granted to deployer.");
}

// Run the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });