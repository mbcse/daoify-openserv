require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./src/contracts",
    artifacts: "./src/artifacts"
  },
  networks: {
    aurora: {
      url: "https://0x4e4541fb.rpc.aurora-cloud.dev",
      chainId: 1313161723,
    }
  }
}; 