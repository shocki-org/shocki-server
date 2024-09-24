require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 100_000,
          },
        },
      },
    ],
  },
  defaultNetwork: 'minato',
  networks: {
    minato: {
      url: process.env.RPC_URL,
      accounts: ['0x' + process.env.DEPLOYER_PRIVATE_KEY],
      gasPrice: 35_000_000_000,
    },
  },
  etherscan: {
    apiKey: {
      minato: 'NONE',
    },
    customChains: [
      {
        network: 'minato',
        chainId: 1946,
        urls: {
          apiURL: 'https://explorer-testnet.soneium.org/api',
          browserURL: 'https://explorer-testnet.soneium.org',
        },
      },
    ],
  },
  paths: {
    sources: process.env.CONTRACTS_PATH,
    artifacts: process.env.ARTIFACTS_PATH,
  },
};
