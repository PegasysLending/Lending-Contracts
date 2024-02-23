import { makeSuite } from './helpers/make-suite';
import { MockContract } from 'ethereum-waffle';
import {
  insertContractAddressInDb,
  getEthersSigners,
  registerContractInJsonDb,
} from '../../helpers/contracts-helpers';
import { MintableERC20 } from '../../types/MintableERC20';
import { WETH9Mocked } from '../../types/WETH9Mocked';
import {
  TokenContractId,
  eContractid,
  tEthereumAddress,
  PegasysPools,
  eEthereumNetwork,
} from '../../helpers/types';
import { PegasysConfig } from '../../markets/pegasys';
import {
  ConfigNames,
  getReservesConfigByPool,
  getTreasuryAddress,
  loadPoolConfig,
} from '../../helpers/configuration';
import { getPairTokenIndexes } from '../../helpers/contracts-getters';
import {
  deployLendingPoolAddressesProvider,
  deployMintableERC20,
  deployLendingPoolAddressesProviderRegistry,
  deployLendingPoolConfigurator,
  deployLendingPool,
  deployPriceOracle,
  deployPegasysOracle,
  deployLendingPoolCollateralManager,
  deployMockFlashLoanReceiver,
  deployWalletBalancerProvider,
  deployPegasysProtocolDataProvider,
  deployLendingRateOracle,
  deployStableAndVariableTokensHelper,
  deployATokensAndRatesHelper,
  deployWETHGateway,
  deployWETHMocked,
} from '../../helpers/contracts-deployments';
import { ethers, network } from 'hardhat';
import { ZERO_ADDRESS } from '../../helpers/constants';
import { deploySupraUnpackerMock } from '../../helpers/contracts-deployments';
import { SupraPriceUnpacker } from '../../types';
import { ISupraSValueFeed } from '../../types/ISupraSValueFeed';
import { getDb } from '../../helpers/misc-utils';

const chai = require('chai');
const { expect } = chai;

makeSuite('PegasysOracle - get price from Supra Oracle', (testEnv) => {
  it('Should have the same decimals', async function () {
    let [prices, indexes] = getPairTokenIndexes(eEthereumNetwork.hardhat);
    prices = prices.map((it) => it.toUpperCase());
    for (let symbol in testEnv.tokens) {
      const index = prices.indexOf(testEnv.tokens[symbol].address.toUpperCase());
      if (index < 0) {
        throw `Token ${symbol} is not set in file contracts-getters.ts for Supra`;
      }
      const { 0: price, 1: decimals, 2: ok } = await testEnv.supraHelper.unpackPrice(
        testEnv.supra.address,
        indexes[index]
      );
      if (!ok) {
        throw `Token ${symbol} is not supported by supra index ${indexes[index]}`;
      }
      expect((await testEnv.tokens[symbol].decimals()).toString()).to.be.equal(
        decimals.toString(),
        `Token ${symbol}`
      );
    }
  });
});