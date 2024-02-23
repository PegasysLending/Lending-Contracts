import { evmRevert, evmSnapshot, DRE, getDb } from '../../../helpers/misc-utils';
import { Signer } from 'ethers';
import {
  getLendingPool,
  getLendingPoolAddressesProvider,
  getPegasysProtocolDataProvider,
  getAToken,
  getMintableERC20,
  getLendingPoolConfiguratorProxy,
  getPriceOracle,
  getLendingPoolAddressesProviderRegistry,
  getWETHMocked,
  getWETHGateway,
} from '../../../helpers/contracts-getters';
import {
  ICommonConfiguration,
  PegasysPools,
  TokenContractId,
  eContractid,
  eEthereumNetwork,
  tEthereumAddress,
} from '../../../helpers/types';
import { PegasysProtocolDataProvider } from '../../../types/PegasysProtocolDataProvider';
import { LendingPool } from '../../../types/LendingPool';
import { MintableERC20 } from '../../../types/MintableERC20';
import { AToken } from '../../../types/AToken';
import { LendingPoolConfigurator } from '../../../types/LendingPoolConfigurator';

import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { almostEqual } from '../../test-pegasys/helpers/almost-equal';
import { PriceOracle } from '../../../types/PriceOracle';
import { LendingPoolAddressesProvider } from '../../../types/LendingPoolAddressesProvider';
import { LendingPoolAddressesProviderRegistry } from '../../../types/LendingPoolAddressesProviderRegistry';
import { getEthersSigners, registerContractInJsonDb } from '../../../helpers/contracts-helpers';
import { getParamPerNetwork } from '../../../helpers/contracts-helpers';
import { WETH9Mocked } from '../../../types/WETH9Mocked';
import { WETHGateway } from '../../../types/WETHGateway';
import { MockContract, solidity } from 'ethereum-waffle';
import { PegasysConfig } from '../../../markets/pegasys';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { usingTenderly } from '../../../helpers/tenderly-utils';
import {
  deployMintableERC20,
  deploySupraUnpackerMock,
  deployWETHMocked,
} from '../../../helpers/contracts-deployments';
import {
  ConfigNames,
  getReservesConfigByPool,
  loadPoolConfig,
} from '../../../helpers/configuration';
import { ZERO_ADDRESS } from '../../../helpers/constants';
import { ethers } from 'hardhat';
import { ISupraSValueFeed } from '../../../types/ISupraSValueFeed';
import {
  ERC20,
  ERC20Factory,
  MintableERC20Factory,
  SupraPriceUnpacker,
  WETH9MockedFactory,
} from '../../../types';

chai.use(bignumberChai());
chai.use(almostEqual());
chai.use(solidity);

export interface SignerWithAddress {
  signer: Signer;
  address: tEthereumAddress;
}

export interface TestEnv {
  deployer: SignerWithAddress;
  supra: ISupraSValueFeed;
  supraHelper: SupraPriceUnpacker;
  tokens: { [symbol: string]: ERC20 };
}

const testEnv: TestEnv = {
  deployer: {} as SignerWithAddress,
  supra: {} as ISupraSValueFeed,
  supraHelper: {} as SupraPriceUnpacker,
  tokens: {},
};

export async function initializeMakeSuite() {
  const [_deployer, ...restSigners] = await getEthersSigners();
  const deployer: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };
  const currentNetwork = DRE.network.name;
  const reserveAssets = getParamPerNetwork(
    PegasysConfig.ReserveAssets,
    currentNetwork as eEthereumNetwork
  );
  testEnv.deployer = deployer;

  const tokens: { [symbol: string]: ERC20 } = {};
  const protoConfigData = getReservesConfigByPool(PegasysPools.proto);
  for (const tokenSymbol of Object.keys(TokenContractId)) {
    if (tokenSymbol === PegasysConfig.WNativeSymbol) {
      // if (!getDb().get(`${tokenSymbol.toUpperCase()}.${currentNetwork}`).value()) {
      //   tokens[tokenSymbol] = await deployWETHMocked();
      //   await registerContractInJsonDb(tokenSymbol.toUpperCase(), tokens[tokenSymbol]);
      // } else {
      //   tokens[tokenSymbol] = await WETH9MockedFactory.connect(
      //     (await getDb().get(`${tokenSymbol.toUpperCase()}.${currentNetwork}`).value()).address,
      //     deployer.signer
      //   );
      // }
      // Only check the standard on chain token
      tokens[tokenSymbol] = await ERC20Factory.connect(reserveAssets[tokenSymbol], deployer.signer);
      continue;
    }
    let decimals = 18;

    let configData = (<any>protoConfigData)[tokenSymbol];

    if (!configData) {
      decimals = 18;
    }

    // if (!getDb().get(`${tokenSymbol.toUpperCase()}.${currentNetwork}`).value()) {
    //   tokens[tokenSymbol] = await deployMintableERC20([
    //     tokenSymbol,
    //     tokenSymbol,
    //     configData ? configData.reserveDecimals : 18,
    //   ]);
    //   await registerContractInJsonDb(tokenSymbol.toUpperCase(), tokens[tokenSymbol]);
    // } else {
    //   tokens[tokenSymbol] = await MintableERC20Factory.connect(
    //     (await getDb().get(`${tokenSymbol.toUpperCase()}.${currentNetwork}`).value()).address,
    //     deployer.signer
    //   );
    // }
    tokens[tokenSymbol] = await ERC20Factory.connect(reserveAssets[tokenSymbol], deployer.signer);
  }
  testEnv.tokens = tokens;

  const supraAddr = PegasysConfig.SupraOracle[currentNetwork];
  if (!supraAddr || supraAddr == ZERO_ADDRESS) {
    throw `SuperaOracle is not set on network ${currentNetwork}, please set it in file markets/pegasys/commons.ts`;
  }
  if (supraAddr)
    testEnv.supra = (await ethers.getContractAt('ISupraSValueFeed', supraAddr)) as ISupraSValueFeed;
  if (!getDb().get(`${eContractid.SupraPriceUnpacker}.${currentNetwork}`).value()) {
    const unpacker = await deploySupraUnpackerMock();
    await registerContractInJsonDb(eContractid.SupraPriceUnpacker, unpacker);
    testEnv.supraHelper = unpacker;
  } else {
    testEnv.supraHelper = (await ethers.getContractAt(
      eContractid.SupraPriceUnpacker,
      (await getDb().get(`${eContractid.SupraPriceUnpacker}.${currentNetwork}`).value()).address
    )) as SupraPriceUnpacker;
  }

  // await deployPegasysOracle([
  //     tokens,
  //     indexes,
  //     mockTokens[PegasysConfig.WNativeSymbol].address,
  //     ZERO_ADDRESS,
  //     PegasysConfig.PegasysOracle[eEthereumNetwork.main]
  // ]);
}

export function makeSuite(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    tests(testEnv);
  });
}
