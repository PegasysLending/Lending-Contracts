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
      WETH: '0xf216ca25B546087C41D11D7d85D38317Cb465fde',
      USDT: '0xb4158590c96EE6c7b1AB9F57aA9BfD62e4B3feAE',
      WBTC: '0x817C777DEf2Fd6ffE2492C6CD124985C78Ee9235',
      WSYS: '0x4200000000000000000000000000000000000006'
    },
    [EthereumNetwork.rolluxMainnet]: {},
    [EthereumNetwork.tenderlyMain]: {},
    [EthereumNetwork.localhost]: {}
  },
};

export default PegasysConfig;
