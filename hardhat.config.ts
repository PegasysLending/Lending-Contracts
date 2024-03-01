import path from 'path';
import fs from 'fs';
import { HardhatUserConfig } from 'hardhat/types';
// @ts-ignore
import { accounts } from './test-wallets.js';
import { eEthereumNetwork } from './helpers/types';
import { BUIDLEREVM_CHAINID, COVERAGE_CHAINID } from './helpers/buidler-constants';

require('dotenv').config();

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'temp-hardhat-etherscan';
import 'hardhat-gas-reporter';
import '@tenderly/hardhat-tenderly';

const SKIP_LOAD = process.env.SKIP_LOAD === 'true';
const DEFAULT_BLOCK_GAS_LIMIT = 10000000;
const DEFAULT_GAS_MUL = 5;
const DEFAULT_GAS_PRICE = 1000000000;
const HARDFORK = 'istanbul';
const MNEMONIC_PATH = "m/44'/60'/0'/0";
const MNEMONIC = process.env.MNEMONIC || '';
const MAINNET_FORK = process.env.MAINNET_FORK === 'true';
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

// Prevent to load scripts before compilation and typechain
if (!SKIP_LOAD) {
  ['misc', 'migrations', 'dev', 'full', 'verifications', 'deployments', 'helpers'].forEach(
    (folder) => {
      const tasksPath = path.join(__dirname, 'tasks', folder);
      fs.readdirSync(tasksPath)
        .filter((pth) => pth.includes('.ts'))
        .forEach((task) => {
          require(`${tasksPath}/${task}`);
        });
    }
  );
}

require(`${path.join(__dirname, 'tasks/misc')}/set-bre.ts`);

const getCommonConfig = (url: string, chainId: number) => {
  return {
    url,
    hardfork: HARDFORK,
    blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
    gasMultiplier: DEFAULT_GAS_MUL,
    gasPrice: DEFAULT_GAS_PRICE,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : {
      mnemonic: MNEMONIC,
      path: MNEMONIC_PATH,
      initialIndex: 0,
      count: 20,
    },
  };
};

const mainnetFork = MAINNET_FORK
  ? {
      blockNumber: 14888323,
      url: `https://rpc.rollux.com`
    }
  : undefined;

const buidlerConfig: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.6.12',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'istanbul',
    },
  },
  mocha: {
    timeout: 1000000,
  },
  networks: {
    coverage: {
      url: 'http://localhost:8555',
      chainId: COVERAGE_CHAINID,
    },
    rolluxTestnet: getCommonConfig('https://rpc-tanenbaum.rollux.com', 5700),
    rolluxMainnet: getCommonConfig('https://rpc.rollux.com', 570),
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      accounts: {
        mnemonic: MNEMONIC,
        path: MNEMONIC_PATH,
      },
    },
    hardhat: {
      hardfork: 'istanbul',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      gasPrice: 8000000000,
      chainId: BUIDLEREVM_CHAINID,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
      // forking: mainnetFork,
    }
  },
};

export default buidlerConfig;
