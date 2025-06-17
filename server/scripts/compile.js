const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  // Compile the contract
  await hre.run('compile');

  // Get the contract artifacts
  const contractPath = path.join(__dirname, '../src/contracts/DaoifyDAO.sol');
  const contractName = 'DaoifyDAO';
  
  // Get the contract factory
  const contractFactory = await hre.ethers.getContractFactory(contractName);
  
  // Get the contract artifact
  const contractArtifact = await hre.artifacts.readArtifact(contractName);
  
  // Create the output object
  const output = {
    abi: contractArtifact.abi,
    bytecode: contractArtifact.bytecode
  };
  
  // Write to a JSON file
  const outputPath = path.join(__dirname, '../src/contracts/DaoifyDAO.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`Contract compiled and artifacts saved to ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 