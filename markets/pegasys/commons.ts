import BigNumber from 'bignumber.js';
import { oneEther, oneRay, RAY, ZERO_ADDRESS } from '../../helpers/constants';
import { ICommonConfiguration, EthereumNetwork, eEthereumNetwork } from '../../helpers/types';

const MOCK_CHAINLINK_AGGREGATORS_PRICES = {
  WETH: oneEther.multipliedBy('1999.32000').toFixed(),
  WBTC: oneEther.multipliedBy('27965.20000').toFixed(),
  USDT: oneEther.multipliedBy('0.9989384').toFixed(),
  WSYS: oneEther.toFixed(),
};
// ----------------
// PROTOCOL GLOBAL PARAMS
// ----------------

export const CommonsConfig: ICommonConfiguration = {
  MarketId: 'Commons',
  ProviderId: 0,
  ProtocolGlobalParams: {
    TokenDistributorPercentageBase: '10000',
    MockUsdPriceInWei: '998938400000000000',
    UsdAddress: '0xf5F7eBF8f7CD2122eC1eA945a82282B8a1b0843f',
    NilAddress: '0x0000000000000000000000000000000000000000',
    OneAddress: '0x0000000000000000000000000000000000000001',
    PegasysReferral: '0',
  },

  // ----------------
  // COMMON PROTOCOL PARAMS ACROSS POOLS AND NETWORKS
  // ----------------

  Mocks: {
    AllAssetsInitialPrices: {
      ...MOCK_CHAINLINK_AGGREGATORS_PRICES,
    },
  },
  LendingRateOracleRatesCommon: {
    USDT: {
      borrowRate: oneRay.multipliedBy(0.03).toFixed(),
    },
    WBTC: {
      borrowRate: oneRay.multipliedBy(0.03).toFixed(),
    },
    WSYS: {
      borrowRate: oneRay.multipliedBy(0.039).toFixed(),
    },
    WETH: {
      borrowRate: oneRay.multipliedBy(0.039).toFixed(),
    }
  },
  // ----------------
  // COMMON PROTOCOL ADDRESSES ACROSS POOLS
  // ----------------

  // If PoolAdmin/emergencyAdmin is set, will take priority over PoolAdminIndex/emergencyAdminIndex
  PoolAdmin: {
    [eEthereumNetwork.coverage]: undefined,
    [eEthereumNetwork.buidlerevm]: undefined,
    [eEthereumNetwork.hardhat]: undefined,
    [eEthereumNetwork.kovan]: undefined,
    [eEthereumNetwork.rinkeby]: undefined,
    [eEthereumNetwork.ropsten]: undefined,
    [eEthereumNetwork.xdai]: undefined,
    [eEthereumNetwork.main]: '0x6C67Be95fb1ac4F03c47Ec1174ec190BD680C64e',
    [eEthereumNetwork.tenderlyMain]: undefined,
    [eEthereumNetwork.localhost]: undefined,
    // TODO when config
    [EthereumNetwork.rolluxTestnet]: undefined,
    [EthereumNetwork.rolluxMainnet]: undefined,
  },
  PoolAdminIndex: 0,
  EmergencyAdmin: {
    [eEthereumNetwork.hardhat]: undefined,
    [eEthereumNetwork.coverage]: undefined,
    [eEthereumNetwork.buidlerevm]: undefined,
    [eEthereumNetwork.kovan]: undefined,
    [eEthereumNetwork.rinkeby]: undefined,
    [eEthereumNetwork.ropsten]: undefined,
    [eEthereumNetwork.xdai]: undefined,
    [eEthereumNetwork.main]: '0x6C67Be95fb1ac4F03c47Ec1174ec190BD680C64e',
    [eEthereumNetwork.tenderlyMain]: undefined,
    [eEthereumNetwork.localhost]: undefined,
    // TODO when config
    [EthereumNetwork.rolluxTestnet]: undefined,
    [EthereumNetwork.rolluxMainnet]: undefined,
  },
  EmergencyAdminIndex: 1,
  ProviderRegistry: {
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.rinkeby]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.xdai]: '',
    [eEthereumNetwork.main]: '',
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]: '',
    // TODO when config First deploy by running 'npm run pegasys:main:deploy-registry'
    [EthereumNetwork.rolluxTestnet]: '',
    [EthereumNetwork.rolluxMainnet]: '',
  },
  ProviderRegistryOwner: {
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.rinkeby]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.xdai]: '',
    [eEthereumNetwork.main]: '',
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]: '',
    // TODO when config the owner of above ProviderRegistry.
    [EthereumNetwork.rolluxTestnet]: '',
    [EthereumNetwork.rolluxMainnet]: '',
  },
  LendingRateOracle: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.rinkeby]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.xdai]: '',
    [eEthereumNetwork.main]: '',
    [eEthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]: '',
    [EthereumNetwork.rolluxTestnet]: '',
    [EthereumNetwork.rolluxMainnet]: '',
  },
  TokenDistributor: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.hardhat]: '',
    [EthereumNetwork.kovan]: '',
    [EthereumNetwork.rinkeby]: '',
    [EthereumNetwork.ropsten]: '',
    [EthereumNetwork.xdai]: '',
    [EthereumNetwork.main]: '',
    [EthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]: '',
    [EthereumNetwork.rolluxTestnet]: '',
    [EthereumNetwork.rolluxMainnet]: '',
  },
  PegasysOracle: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [EthereumNetwork.kovan]: '',
    [EthereumNetwork.rinkeby]: '',
    [EthereumNetwork.ropsten]: '',
    [EthereumNetwork.xdai]: '',
    [EthereumNetwork.main]: '',
    [EthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]: '',
    [EthereumNetwork.rolluxTestnet]: '',
    [EthereumNetwork.rolluxMainnet]: '',
  },
  FallbackOracle: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [EthereumNetwork.kovan]: '',
    [EthereumNetwork.rinkeby]: ZERO_ADDRESS,
    [EthereumNetwork.ropsten]: '',
    [EthereumNetwork.xdai]: ZERO_ADDRESS,
    [EthereumNetwork.main]: ZERO_ADDRESS,
    [EthereumNetwork.tenderlyMain]: ZERO_ADDRESS,
    [EthereumNetwork.localhost]: '',
    // TODO when config this can be zero if no use
    [EthereumNetwork.rolluxTestnet]: ZERO_ADDRESS,
    [EthereumNetwork.rolluxMainnet]: ZERO_ADDRESS,
  },
  ChainlinkAggregator: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [EthereumNetwork.kovan]: {},
    [EthereumNetwork.rinkeby]: {},
    [EthereumNetwork.ropsten]: {},
    [EthereumNetwork.xdai]: {},
    [EthereumNetwork.main]: {},
    // TODO when config
    [EthereumNetwork.rolluxTestnet]: {
      WBTC: '0x4b464cCc42fc31c3c795e344a601a7C20fd4C93C',
      WSYS: '0x094Fc67fD51135eC91fCa72ed8C229fE7c5E3B32',
      USDT: '0x8d2644F9D95453CC474cE3A92cefE4b1a28aab0b',
    },
    [EthereumNetwork.rolluxMainnet]: {
    },
    [EthereumNetwork.tenderlyMain]: {},
    [eEthereumNetwork.localhost]: {},
  },
  SupraOracle: {
    [eEthereumNetwork.coverage]: ZERO_ADDRESS,
    [eEthereumNetwork.hardhat]: "0x14Dbb98a8e9A77cE5B946145bb0194aDE5dA7611",
    [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
    [EthereumNetwork.xdai]: ZERO_ADDRESS,
    [EthereumNetwork.main]: '0x14Dbb98a8e9A77cE5B946145bb0194aDE5dA7611',
    [EthereumNetwork.kovan]: ZERO_ADDRESS,
    [EthereumNetwork.rinkeby]: ZERO_ADDRESS,
    [EthereumNetwork.ropsten]: ZERO_ADDRESS,
    [EthereumNetwork.tenderlyMain]: ZERO_ADDRESS,
    [EthereumNetwork.localhost]: ZERO_ADDRESS,
    // TODO when config
    [EthereumNetwork.rolluxTestnet]: '0x14Dbb98a8e9A77cE5B946145bb0194aDE5dA7611',
    [EthereumNetwork.rolluxMainnet]: '0xbc0453F6FAC74FB46223EA5CC55Bd82852f0C670',
  },
  ReserveAssets: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [EthereumNetwork.xdai]: {},
    [EthereumNetwork.main]: {},
    [EthereumNetwork.kovan]: {},
    [EthereumNetwork.rinkeby]: {},
    [EthereumNetwork.ropsten]: {},
    [EthereumNetwork.tenderlyMain]: {},
    [eEthereumNetwork.localhost]: {},
    [EthereumNetwork.rolluxTestnet]: {},
    [EthereumNetwork.rolluxMainnet]: {},
  },
  ReservesConfig: {},
  ATokenDomainSeparator: {
    [eEthereumNetwork.coverage]:
      '0x95b73a72c6ecf4ccbbba5178800023260bad8e75cdccdb8e4827a2977a37c820',
    [eEthereumNetwork.hardhat]:
      '0xbae024d959c6a022dc5ed37294cd39c141034b2ae5f02a955cce75c930a81bf5',
    [eEthereumNetwork.buidlerevm]:
      '0xbae024d959c6a022dc5ed37294cd39c141034b2ae5f02a955cce75c930a81bf5',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.rinkeby]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.xdai]: '',
    [eEthereumNetwork.main]: '',
    [eEthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.rolluxTestnet]: '',
    [eEthereumNetwork.rolluxMainnet]: '',
  },
  WNATIVE: {
    [eEthereumNetwork.coverage]: '', // deployed in local evm
    [eEthereumNetwork.hardhat]: '', // deployed in local evm
    [eEthereumNetwork.buidlerevm]: '', // deployed in local evm
    [eEthereumNetwork.kovan]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    [eEthereumNetwork.rinkeby]: '0xc778417e063141139fce010982780140aa0cd5ab',
    [eEthereumNetwork.ropsten]: '0xc778417e063141139fce010982780140aa0cd5ab',
    [eEthereumNetwork.xdai]: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    [eEthereumNetwork.main]: '0x65b28cBda2E2Ff082131549C1198DC9a50328186', // current is WSYS
    [eEthereumNetwork.tenderlyMain]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [eEthereumNetwork.localhost]: '',
    // TODO when config Customized the WNATIVE
    [eEthereumNetwork.rolluxTestnet]: '0x65b28cBda2E2Ff082131549C1198DC9a50328186',
    [eEthereumNetwork.rolluxMainnet]: ''
  },
  // TODO when config Update Wrapped native
  WNativeSymbol: 'WSYS',
  ReserveFactorTreasuryAddress: {
    [eEthereumNetwork.coverage]: '0x2d206Fd0C7c76016234810232159b05562608A42',
    [eEthereumNetwork.hardhat]: '0x2d206Fd0C7c76016234810232159b05562608A42',
    [eEthereumNetwork.buidlerevm]: '0x2d206Fd0C7c76016234810232159b05562608A42',
    [eEthereumNetwork.kovan]: '0x2d206Fd0C7c76016234810232159b05562608A42',
    [eEthereumNetwork.rinkeby]: '0x2d206Fd0C7c76016234810232159b05562608A42',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.xdai]: '0xb4c575308221CAA398e0DD2cDEB6B2f10d7b000A',
    [eEthereumNetwork.main]: '0x39ed63a65AD05e623d641669c336769b51eDEF8C',//to be replace check https://gnosisscan.io/address/0xb4c575308221CAA398e0DD2cDEB6B2f10d7b000A
    [eEthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]:'',
    // TODO when config Custom treasury address 
    [eEthereumNetwork.rolluxMainnet]:'',
    [eEthereumNetwork.rolluxTestnet]: '0x39ed63a65AD05e623d641669c336769b51eDEF8C'
  },
};
