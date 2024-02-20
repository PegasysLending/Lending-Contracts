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
    AaveReferral: '0',
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
    // TODO when config
    [eEthereumNetwork.main]: '0x6C67Be95fb1ac4F03c47Ec1174ec190BD680C64e',
    [eEthereumNetwork.tenderlyMain]: undefined,
    [eEthereumNetwork.localhost]: undefined
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
    // TODO when config
    [eEthereumNetwork.main]: '0x6C67Be95fb1ac4F03c47Ec1174ec190BD680C64e',
    [eEthereumNetwork.tenderlyMain]: undefined,
    [eEthereumNetwork.localhost]: undefined,
  },
  EmergencyAdminIndex: 1,
  ProviderRegistry: {
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.rinkeby]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.xdai]: '',
    // TODO when config First deploy by running 'npm run pegasys:main:deploy-registry'
    [eEthereumNetwork.main]: '0xedeDc468883931B05c8F40f61bcCF765a88210A2',
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]: '',
  },
  ProviderRegistryOwner: {
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.rinkeby]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.xdai]: '',
    // TODO when config the owner of above ProviderRegistry.
    [eEthereumNetwork.main]: '0xf4EbbB650bF65400f8de2Cd5161847014Cd68c92',
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]: '',
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
    [eEthereumNetwork.localhost]: '',
  },
  ChainlinkAggregator: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [EthereumNetwork.kovan]: {
      AGVE: '', // actually AAVE
      WXDAI: '', // actually DAI
      HNY: '', // actually MKR
      WBTC: '0xF7904a295A029a3aBDFFB6F12755974a958C7C25',
      WETH: '',
      USD: '0x9326BFA02ADD2366b30bacB125260Af641031331',
    },
    [EthereumNetwork.rinkeby]: {
      AGVE: '0x9c1946428f4f159dB4889aA6B218833f467e1BfD', // actually XAG (silver)
      USDC: '0xa24de01df22b63d23Ebc1882a5E3d4ec0d907bFB',
      HNY: '0xd8bD0a1cB028a31AA859A21A3758685a95dE4623', // actually LINK
      LINK: '0xd8bD0a1cB028a31AA859A21A3758685a95dE4623', // actually LINK
      WBTC: '0xECe365B379E1dD183B20fc5f022230C044d51404',
      WETH: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
      WNATIVE: '0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF', // actually DAI
      USD: '0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF',
    },
    [EthereumNetwork.ropsten]: {
      BAT: '0xafd8186c962daf599f171b8600f3e19af7b52c92',
      BUSD: '0x0A32D96Ff131cd5c3E0E5AAB645BF009Eda61564',
      DAI: '0x64b8e49baded7bfb2fd5a9235b2440c0ee02971b',
      KNC: '0x19d97ceb36624a31d827032d8216dd2eb15e9845',
      LINK: '0xb8c99b98913bE2ca4899CdcaF33a3e519C20EeEc',
      MANA: '0xDab909dedB72573c626481fC98CEE1152b81DEC2',
      MKR: '0x811B1f727F8F4aE899774B568d2e72916D91F392',
      SNX: '0xA95674a8Ed9aa9D2E445eb0024a9aa05ab44f6bf',
      SUSD: '0xe054b4aee7ac7645642dd52f1c892ff0128c98f0',
      TUSD: '0x523ac85618df56e940534443125ef16daf785620',
      USDC: '0xe1480303dde539e2c241bdc527649f37c9cbef7d',
      USDT: '0xc08fe0c4d97ccda6b40649c6da621761b628c288',
      WBTC: '0x5b8B87A0abA4be247e660B0e0143bB30Cdf566AF',
      ZRX: '0x1d0052e4ae5b4ae4563cbac50edc3627ca0460d7',
      USD: '0x8468b2bDCE073A157E560AA4D9CcF6dB1DB98507',
    },
    [EthereumNetwork.xdai]: {
      // AGVE: '',
      USDC: '0x26C31ac71010aF62E6B486D1132E266D6298857D',
      WETH: '0xa767f745331D267c7751297D982b050c93985627',
      GNO: '0x22441d81416430A54336aB28765abd31a792Ad37',
      WBTC: '0x00288135bE38B83249F380e9b6b9a04c90EC39eE',
      WNATIVE: '0x678df3415fc31947dA4324eC63212874be5a82f8',
      USD: '0x678df3415fc31947dA4324eC63212874be5a82f8',
      LINK: '0xed322a5ac55bae091190dff9066760b86751947b',
      FOX: '0x22441d81416430A54336aB28765abd31a792Ad37',
      USDT: '0x68811D7DF835B1c33e6EEae8E7C141eF48d48cc7',
      EURe: '0xab70BCB260073d036d1660201e9d5405F5829b7a',
      wstETH: '0xae27e63307963850c4d30BFba78FC1116d7b48C3',
    },
    [EthereumNetwork.main]: {
      // AGVE: '',
      // USDC: '0x8d2644F9D95453CC474cE3A92cefE4b1a28aab0b',
      // WETH: '0x26690F9f17FdC26D419371315bc17950a0FC90eD',
      // MATIC: '0x3ACccB328Db79Af1B81a4801DAf9ac8370b9FBF8',
      WBTC: '0x4b464cCc42fc31c3c795e344a601a7C20fd4C93C',
      WSYS: '0x094Fc67fD51135eC91fCa72ed8C229fE7c5E3B32',
      // USD: '0x678df3415fc31947dA4324eC63212874be5a82f8',
      // LINK: '0xed322a5ac55bae091190dff9066760b86751947b',
      // FOX: '0x22441d81416430A54336aB28765abd31a792Ad37',
      USDT: '0x8d2644F9D95453CC474cE3A92cefE4b1a28aab0b',
      // EURe: '0xab70BCB260073d036d1660201e9d5405F5829b7a',
      // wstETH: '0xae27e63307963850c4d30BFba78FC1116d7b48C3',
    },
    [EthereumNetwork.tenderlyMain]: {
      AAVE: '0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012',
      BAT: '0x0d16d4528239e9ee52fa531af613AcdB23D88c94',
      BUSD: '0x614715d2Af89E6EC99A233818275142cE88d1Cfd',
      DAI: '0x773616E4d11A78F511299002da57A0a94577F1f4',
      ENJ: '0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B',
      KNC: '0x656c0544eF4C98A6a98491833A89204Abb045d6b',
      LINK: '0xDC530D9457755926550b59e8ECcdaE7624181557',
      MANA: '0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9',
      MKR: '0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2',
      REN: '0x3147D7203354Dc06D9fd350c7a2437bcA92387a4',
      SNX: '0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c',
      SUSD: '0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757',
      TUSD: '0x3886BA987236181D98F2401c507Fb8BeA7871dF2',
      UNI: '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e',
      USDC: '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
      USDT: '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
      WBTC: '0xdeb288F737066589598e9214E782fa5A8eD689e8',
      YFI: '0x7c5d4F8345e66f68099581Db340cd65B078C41f4',
      ZRX: '0x2Da4983a622a8498bb1a21FaE9D8F6C664939962',
      USD: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    },
    [eEthereumNetwork.localhost]: {},
  },
  SupraOracle: {
    [eEthereumNetwork.coverage]: ZERO_ADDRESS,
    [eEthereumNetwork.hardhat]: ZERO_ADDRESS,
    [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
    [EthereumNetwork.xdai]: ZERO_ADDRESS,
    [EthereumNetwork.main]: '0x14Dbb98a8e9A77cE5B946145bb0194aDE5dA7611',
    [EthereumNetwork.kovan]: ZERO_ADDRESS,
    [EthereumNetwork.rinkeby]: ZERO_ADDRESS,
    [EthereumNetwork.ropsten]: ZERO_ADDRESS,
    [EthereumNetwork.tenderlyMain]: ZERO_ADDRESS,
    [eEthereumNetwork.localhost]: ZERO_ADDRESS,
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
  },
  WNATIVE: {
    [eEthereumNetwork.coverage]: '', // deployed in local evm
    [eEthereumNetwork.hardhat]: '', // deployed in local evm
    [eEthereumNetwork.buidlerevm]: '', // deployed in local evm
    [eEthereumNetwork.kovan]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    [eEthereumNetwork.rinkeby]: '0xc778417e063141139fce010982780140aa0cd5ab',
    [eEthereumNetwork.ropsten]: '0xc778417e063141139fce010982780140aa0cd5ab',
    [eEthereumNetwork.xdai]: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    // TODO when config Customized the WNATIVE
    [eEthereumNetwork.main]: '0x65b28cBda2E2Ff082131549C1198DC9a50328186', // current is WSYS
    [eEthereumNetwork.tenderlyMain]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [eEthereumNetwork.localhost]: '',
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
    // TODO when config Custom treasury address 
    [eEthereumNetwork.main]: '0xf4EbbB650bF65400f8de2Cd5161847014Cd68c92',//to be replace check https://gnosisscan.io/address/0xb4c575308221CAA398e0DD2cDEB6B2f10d7b000A
    [eEthereumNetwork.tenderlyMain]: '',
    [eEthereumNetwork.localhost]:'',
  },
};
