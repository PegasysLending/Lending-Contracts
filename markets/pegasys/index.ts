import { oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { IPegasysConfiguration, EthereumNetwork, eEthereumNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyUSDT,
  strategyWBTC,
  strategyWSYS,
  strategyWETH,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const PegasysConfig: IPegasysConfiguration = {
  ...CommonsConfig,
  MarketId: 'Packer genesis market',
  ProviderId: 1,
  // TODO when config
  // Important.  reserveDecimals must be equal to the decimals of token
  ReservesConfig: {
    WBTC: strategyWBTC,
    WETH: strategyWETH,
    USDT: strategyUSDT,
    WSYS: strategyWSYS,
  },
  ReserveAssets: {
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.coverage]: {},
    [EthereumNetwork.kovan]: {},
    [EthereumNetwork.rinkeby]: {},
    [EthereumNetwork.ropsten]: {},
    [EthereumNetwork.xdai]: {},
    [EthereumNetwork.main]: {},
    // TODO when config Customize reserve assets here
    [EthereumNetwork.rolluxTestnet]: {
      WETH: '0xFE0e902E5F363029870BDc871D27b0C9C46c8b80',
      USDT: '0xd270B0EdA02c6fEF5E213Bc99D4255B9eDd22617',
      WBTC: '0x386aFa4cED76F3Ddd5D086599030fC21B7Ad9c10',
      WSYS: '0x65b28cBda2E2Ff082131549C1198DC9a50328186'
    },
    [EthereumNetwork.rolluxMainnet]: {},
    [EthereumNetwork.tenderlyMain]: {},
    [EthereumNetwork.localhost]: {}
  },
};

export default PegasysConfig;
