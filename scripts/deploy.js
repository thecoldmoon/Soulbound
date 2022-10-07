// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  
  creatorAddress = '0x80d4a26dc0E44e7C1CCb499E9F1A84eEA51D7a43'
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log("Deploying the contract to the network:", network.name);
  console.log("Contract deploying:", "Soulbound")
  const Soulbound = await ethers.getContractFactory("SoulBound", "chickens");
  const soulbound = await Soulbound.deploy(creatorAddress);
  await soulbound.deployed();

  console.log("Soulbound address:", soulbound.address);
  saveFrontendFiles(soulbound)
}
function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("SoulBound");

  fs.writeFileSync(
    path.join(contractsDir, "Soulbound.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });