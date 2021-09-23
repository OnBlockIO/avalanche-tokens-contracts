require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-web3");
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-etherscan");

const {
  MAINNET_PRIVATE_KEYS,
  TESTNET_PRIVATE_KEYS,
  EXPLORER_API_KEY,
} = require('./.secrets.json');

task("accounts", "Prints accounts", async (_, { web3 }) => {

  console.log(await web3.eth.getAccounts());

});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",    // Fetch exact version from solc-bin (default: truffle's version)
    settings: {          // See the solidity docs for advice about optimization and evmVersion
      optimizer: {
        enabled: true,
        runs: 250,
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  networks: {
    hardhat: {
    },
    mainnet: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      accounts: MAINNET_PRIVATE_KEYS
    },
    testnet: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts: TESTNET_PRIVATE_KEYS
    },
  },
  etherscan: {
    apiKey: EXPLORER_API_KEY
  },
  mocha: {
    timeout: 200000
  }
};