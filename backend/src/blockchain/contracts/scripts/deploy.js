const hre = require("hardhat");

/**
 * Deployment script for Voting System Smart Contracts
 * 
 * Deploys:
 * 1. ElectionKeyManager - Manages election cryptographic keys
 * 2. VoteContract - Handles vote recording with ZK proofs
 */
async function main() {
  console.log("========================================");
  console.log("Deploying Voting System Smart Contracts");
  console.log("========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", (await deployer.getBalance()).toString());
  console.log("");

  // ========================================
  // Deploy ElectionKeyManager
  // ========================================
  console.log("1. Deploying ElectionKeyManager...");

  const ElectionKeyManager = await hre.ethers.getContractFactory("ElectionKeyManager");
  const keyManager = await ElectionKeyManager.deploy(deployer.address);
  
  await keyManager.deployed();
  console.log("   ElectionKeyManager deployed to:", keyManager.address);

  // Grant KEY_SETTER_ROLE to deployer for initial setup
  const KEY_SETTER_ROLE = await keyManager.KEY_SETTER_ROLE();
  await keyManager.grantRole(KEY_SETTER_ROLE, deployer.address);
  console.log("   Granted KEY_SETTER_ROLE to deployer\n");

  // ========================================
  // Deploy VoteContract
  // ========================================
  console.log("2. Deploying VoteContract...");

  const VoteContract = await hre.ethers.getContractFactory("VoteContract");
  const voteContract = await VoteContract.deploy(keyManager.address);
  
  await voteContract.deployed();
  console.log("   VoteContract deployed to:", voteContract.address);

  // ========================================
  // Verify deployment
  // ========================================
  console.log("\n========================================");
  console.log("Deployment Complete!");
  console.log("========================================\n");

  console.log("Contract Addresses:");
  console.log("===================");
  console.log(`ElectionKeyManager: ${keyManager.address}`);
  console.log(`VoteContract: ${voteContract.address}\n`);

  console.log("Next Steps:");
  console.log("===========");
  console.log("1. Set election keys via ElectionKeyManager.setElectionKeys()");
  console.log("2. Add candidates via VoteContract.addCandidate()");
  console.log("3. Set election state to Registration via VoteContract.setElectionState()");
  console.log("4. When ready, set election state to Voting\n");

  // ========================================
  // Save deployment addresses
  // ========================================
  const fs = require("fs");
  const path = require("path");

  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    timestamp: new Date().toISOString(),
    contracts: {
      ElectionKeyManager: {
        address: keyManager.address,
        constructorArgs: [deployer.address],
      },
      VoteContract: {
        address: voteContract.address,
        constructorArgs: [keyManager.address],
      },
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentFile}`);

  return {
    keyManager: keyManager.address,
    voteContract: voteContract.address,
  };
}

main()
  .then((addresses) => {
    console.log("\nDeployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
