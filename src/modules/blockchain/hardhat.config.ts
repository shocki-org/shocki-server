import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
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
      url: 'https://soneium-minato.rpc.scs.startale.com/?apikey=BFlJo8vAg4VBibKgfmKBvItDiUoQrHxg',
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
    sources: './src/modules/blockchain/contracts',
    artifacts: './src/modules/blockchain/artifacts/artifacts',
  },
};

export default config;
