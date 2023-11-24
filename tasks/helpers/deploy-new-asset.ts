import { PoolConfiguration } from './../../helpers/types';
import { task } from 'hardhat/config';
import { EthereumNetwork } from '../../helpers/types';
import { getTreasuryAddress } from '../../helpers/configuration';
import * as marketConfigs from '../../markets/agave';
import * as reserveConfigs from '../../markets/agave/reservesConfigs';
import { chooseATokenDeployment } from '../../helpers/init-helpers';
import {
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
  getStableAndVariableTokensHelper,
  getLendingRateOracle,
} from './../../helpers/contracts-getters';
import {
  deployDefaultReserveInterestRateStrategy,
  deployStableDebtToken,
  deployVariableDebtToken,
} from './../../helpers/contracts-deployments';
import { setDRE } from '../../helpers/misc-utils';
import { CommonsConfig } from '../../markets/agave/commons';

const LENDING_POOL_ADDRESS_PROVIDER = {
  main: '0x17F701D30487b0D718772449f3468C05Be61258f',
};
const incentiveControllerAddress = '0xF7ecfD1D712CF8A487d867D4dE20C09804cD3793';

const isSymbolValid = (symbol: string, network: EthereumNetwork) =>
  marketConfigs.AaveConfig.ReserveAssets[network][symbol] &&
  marketConfigs.AaveConfig.ReservesConfig[symbol] != null;

// npx hardhat --network main external:deploy-new-asset --symbol {CustomToken} --auto-init-reserve
task('external:deploy-new-asset', 'Deploy A token, Debt Tokens, Risk Parameters')
  .addParam('symbol', `Asset symbol, needs to have configuration ready`)
  .addFlag('verify', 'Verify contracts at Etherscan')
  .addFlag('autoInitReserve', 'Auto initReserve by LendingPoolConfigurator contracts')
  .setAction(async ({ verify, symbol, autoInitReserve }, localBRE) => {
    const network = localBRE.network.name;
    if (!isSymbolValid(symbol, network as EthereumNetwork)) {
      throw new Error(
        `
WRONG RESERVE ASSET SETUP:
        The symbol ${symbol} has no reserve Config and/or reserve Asset setup.
        update /markets/aave/index.ts and add the asset address for ${network} network
        update /markets/aave/reservesConfigs.ts and add parameters for ${symbol}
        `
      );
    }

    setDRE(localBRE);
    const strategyParams = marketConfigs.AaveConfig.ReservesConfig[symbol];
    const reserveAssetAddress = marketConfigs.AaveConfig.ReserveAssets[localBRE.network.name][symbol];
    const deployCustomAToken = chooseATokenDeployment(strategyParams.aTokenImpl);
    const addressProvider = await getLendingPoolAddressesProvider(
      LENDING_POOL_ADDRESS_PROVIDER[network]
    );
    const poolAddress = await addressProvider.getLendingPool();
    console.log({ poolAddress, addressProvider: addressProvider.address });

    const treasuryAddress = await getTreasuryAddress(marketConfigs.AaveConfig);
    const displaySymbol = symbol != 'WNATIVE' ? symbol : marketConfigs.AaveConfig.WNativeSymbol;

    const aToken = await deployCustomAToken(
      [
        poolAddress,
        reserveAssetAddress,
        treasuryAddress,
        `Agave interest bearing ${displaySymbol}`,
        `ag${displaySymbol}`,
        incentiveControllerAddress,
      ],
      verify
    );
    const stableDebt = await deployStableDebtToken(
      [
        poolAddress,
        reserveAssetAddress,
        `Agave stable debt bearing ${displaySymbol}`,
        `stableDebt${displaySymbol}`,
        incentiveControllerAddress,
      ],
      verify
    );
    const variableDebt = await deployVariableDebtToken(
      [
        poolAddress,
        reserveAssetAddress,
        `Agave variable debt bearing ${displaySymbol}`,
        `variableDebt${displaySymbol}`,
        incentiveControllerAddress,
      ],
      verify
    );
    const rates = await deployDefaultReserveInterestRateStrategy(
      [
        addressProvider.address,
        strategyParams.optimalUtilizationRate,
        strategyParams.baseVariableBorrowRate,
        strategyParams.variableRateSlope1,
        strategyParams.variableRateSlope2,
        strategyParams.stableRateSlope1,
        strategyParams.stableRateSlope2,
      ],
      verify
    );
    console.log(`
    New interest bearing asset deployed on ${network}:
    Interest bearing ag${displaySymbol} address: ${aToken.address}
    Variable Debt variableDebt${displaySymbol} address: ${variableDebt.address}
    Stable Debt stableDebt${displaySymbol} address: ${stableDebt.address}
    Strategy Implementation for ${displaySymbol} address: ${rates.address}
    `);

    if (autoInitReserve) {
      // Assets added to pool
      const aTokensAndRatesHelper = await getLendingPoolConfiguratorProxy();
      console.log('aTokensAndRatesHelper====>', aTokensAndRatesHelper.address);
      const initReserveTxid = await aTokensAndRatesHelper.initReserve(
        aToken.address,
        stableDebt.address,
        variableDebt.address,
        18,
        rates.address
      );
      console.log('initReserveTxid===>', initReserveTxid);

      const currAssetConfig = reserveConfigs.CustomToken;//TODO CustomToken Need to be set in reserveConfigs
      console.log(reserveAssetAddress);

      const configureReserveAsCollateralTxid =
        await aTokensAndRatesHelper.configureReserveAsCollateral(
          reserveAssetAddress,
          currAssetConfig.baseLTVAsCollateral,
          currAssetConfig.liquidationThreshold,
          currAssetConfig.liquidationBonus
        );
      console.log('configureReserveAsCollateralTxid===>', configureReserveAsCollateralTxid);

      const enableBorrowingOnReserveTxid = await aTokensAndRatesHelper.enableBorrowingOnReserve(
        reserveAssetAddress,
        currAssetConfig.stableBorrowRateEnabled
      );
      console.log('configureReserveAsCollateralTxid===>', enableBorrowingOnReserveTxid);

      const setReserveFactorTxid = await aTokensAndRatesHelper.setReserveFactor(
        reserveAssetAddress,
        currAssetConfig.reserveFactor
      );
      console.log('setReserveFactorTxid===>', setReserveFactorTxid);

      // Administrator permission conversion
      /*
      const lendingRateOracle = await getLendingRateOracle();
      const res = await lendingRateOracle['transferOwnership(address)'](
        '0x5Dda19AC38b19788A7842819d6673034006090E1'
      )
      console.log(res);
      return;
      */

      const lendingRateOracle = await getLendingRateOracle();
      // const stableAndVariableTokenHelper = await getStableAndVariableTokensHelper();
      const setOracleBorrowRatesTxid = await lendingRateOracle.setMarketBorrowRate(
        reserveAssetAddress,
        CommonsConfig.LendingRateOracleRatesCommon[symbol]['borrowRate']
      );
      console.log('setOracleBorrowRatesTxid===>', setOracleBorrowRatesTxid);
    }
  });

