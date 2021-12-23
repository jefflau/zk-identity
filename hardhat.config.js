require('@nomiclabs/hardhat-waffle')

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require('./tasks/faucet')

module.exports = {
  solidity: '0.8.10',
  networks: {
    hardhat: {
      accounts: [],
      loggingEnabled: false,
      allowUnlimitedContractSize: false
    },
    goerli: {
      url: "https://goerli.infura.io/v3/5667a1f708754d8687b99382f8b3a92a",
      accounts: [],
    }
  },
}
