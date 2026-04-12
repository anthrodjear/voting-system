require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    besu: {
      url: process.env.BESU_RPC_URL || 'http://localhost:8545',
      chainId: parseInt(process.env.BESU_CHAIN_ID || '1337', 10),
      accounts: process.env.BESU_PRIVATE_KEY ? [process.env.BESU_PRIVATE_KEY] : [],
    },
    besuLocal: {
      url: 'http://localhost:8545',
      chainId: 1337,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
      },
    },
  },
};

module.exports = config;