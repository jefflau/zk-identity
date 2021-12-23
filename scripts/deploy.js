// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Verifier = await ethers.getContractFactory("Verifier")
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log("Verifier address:", verifier.address);

  const AttestationMinter = await ethers.getContractFactory("AttestationMinter");
  const minter = await AttestationMinter.deploy(verifier.address);
  await minter.deployed();
  console.log("AttestationMinter address:", minter.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(minter);
}

function saveFrontendFiles(minter) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ AttestationMinter: minter.address }, undefined, 2)
  );

  const MinterArtifact = artifacts.readArtifactSync("AttestationMinter");

  fs.writeFileSync(
    contractsDir + "/AttestationMinter.json",
    JSON.stringify(MinterArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
