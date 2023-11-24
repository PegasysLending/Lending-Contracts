import { oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { IAaveConfiguration, EthereumNetwork, eEthereumNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
// TODO: Set up the registery settings
import {
  strategyETH,
  // strategyUSDC,
  strategyUSDT,
  // strategyLINK,
  strategyWBTC,
  strategyWTEST1,
  // strategyWETH,
  // strategyMATIC,
  // strategyFOX,
  // strategyEURe,
  // strategywstETH,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const AaveConfig: IAaveConfiguration = {
  ...CommonsConfig,
  MarketId: 'Packer genesis market',
  ProviderId: 1,
  ReservesConfig: {
    // AGVE: strategyAAVE,
    // USDC: strategyUSDC,
    WNATIVE: strategyETH,
    // LINK: strategyLINK,
    // MATIC: strategyMATIC,
    WBTC: strategyWBTC,
    // WETH: strategyWETH,
    // FOX: strategyFOX,
    USDT: strategyUSDT,
    WTEST1: strategyWTEST1
    // EURe: strategyEURe,
    // wstETH: strategywstETH,
  },
  ReserveAssets: {
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.coverage]: {},
    [EthereumNetwork.kovan]: {
      AGVE: '0xC1d880d3C59A64e54238F2F023b982dadC10D249',
      WNATIVE: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
      HNY: '0xe92b757a05ca29221ef04333ee5f7dc38a2e408b',
      WBTC: '0xD1B98B6607330172f1D991521145A22BCe793277',
      WETH: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    },
    [EthereumNetwork.rinkeby]: {
      AGVE: '0x838341c70E1f02382AdA5e867DA7E5EC85fC47b7',
      USDC: '0xc96Bb228C73FB09F9A2e26A840841f277D1cCC48',
      WETH: '0xdf032bc4b9dc2782bb09352007d4c57b75160b15',
      HNY: '0xa30CCf67b489d627De8F8c035F5b9676442646e0',
      LINK: '0xe2981a5D03449c76826e46Ac4D717e77479b9C07',
      WBTC: '0x64ed1291fe07ade7bb261c7aa8491e4bc0e8de1c',
      WNATIVE: '0xc778417e063141139fce010982780140aa0cd5ab',
    },
    [EthereumNetwork.ropsten]: {
      AAVE: '',
      BAT: '0x85B24b3517E3aC7bf72a14516160541A60cFF19d',
      BUSD: '0xFA6adcFf6A90c11f31Bc9bb59eC0a6efB38381C6',
      DAI: '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108',
      ENJ: ZERO_ADDRESS,
      KNC: '0xCe4aA1dE3091033Ba74FA2Ad951f6adc5E5cF361',
      LINK: '0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486',
      MANA: '0x78b1F763857C8645E46eAdD9540882905ff32Db7',
      MKR: '0x2eA9df3bABe04451c9C3B06a2c844587c59d9C37',
      REN: ZERO_ADDRESS,
      SNX: '0xF80Aa7e2Fda4DA065C55B8061767F729dA1476c7',
      SUSD: '0xc374eB17f665914c714Ac4cdC8AF3a3474228cc5',
      TUSD: '0xa2EA00Df6d8594DBc76b79beFe22db9043b8896F',
      UNI: ZERO_ADDRESS,
      USDC: '0x851dEf71f0e6A903375C1e536Bd9ff1684BAD802',
      USDT: '0xB404c51BBC10dcBE948077F18a4B8E553D160084',
      WBTC: '0xa0E54Ab6AA5f0bf1D62EC3526436F3c05b3348A0',
      WETH: '0xc778417e063141139fce010982780140aa0cd5ab',
      YFI: ZERO_ADDRESS,
      ZRX: '0x02d7055704EfF050323A2E5ee4ba05DB2A588959',
    },
    [EthereumNetwork.xdai]: {
      // AGVE: '0x3a97704a1b25F08aa230ae53B352e2e72ef52843',
      GNO: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
      LINK: '0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2',
      USDC: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
      WETH: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
      WBTC: '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252',
      WNATIVE: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
      FOX: '0x21a42669643f45Bc0e086b8Fc2ed70c23D67509d',
      USDT: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
      EURe: '0xcB444e90D8198415266c6a2724b7900fb12FC56E',
      wstETH: '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6',
    },
    // TODO: Customize reserve assets here
    [EthereumNetwork.main]: {
      // MATIC: '0xff8eD5f4167C07b95B4e9AEfe6d18FE6a3d7C9d1',
      USDT: '0x9D973BAc12BB62A55be0F9f7Ad201eEA4f9B8428',
      // USDC: '0x9D973BAc12BB62A55be0F9f7Ad201eEA4f9B8428',
      WBTC: '0xfA600253bB6fE44CEAb0538000a8448807e50c85',
      WNATIVE: '0xcAc0759160d57A33D332Ed36a555C10957694407',
      WTEST1: '0xa81B1904f1E288D79d672bCDF847c98CBF0FF49b'
    },
    // [EthereumNetwork.main]: {
    //   AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    //   BAT: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
    //   BUSD: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
    //   DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //   ENJ: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
    //   KNC: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
    //   LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    //   MANA: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
    //   MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    //   REN: '0x408e41876cCCDC0F92210600ef50372656052a38',
    //   SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    //   SUSD: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
    //   TUSD: '0x0000000000085d4780B73119b644AE5ecd22b376',
    //   UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    //   USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //   USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //   WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //   WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //   YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    //   ZRX: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    // },
    [EthereumNetwork.tenderlyMain]: {
      AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      BAT: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
      BUSD: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      ENJ: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
      KNC: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
      LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      MANA: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      REN: '0x408e41876cCCDC0F92210600ef50372656052a38',
      SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
      SUSD: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
      TUSD: '0x0000000000085d4780B73119b644AE5ecd22b376',
      UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
      ZRX: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    },
  },
};

export default AaveConfig;
