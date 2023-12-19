import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  getATokensAndRatesHelper,
  getLendingPoolAddressesProvider,
  getStableAndVariableTokensHelper,
} from '../../helpers/contracts-getters';
import { chunk } from '../../helpers/misc-utils';
import {
  ICommonConfiguration,
  IReserveParams,
  eContractid,
  eEthereumNetwork,
} from '../../helpers/types';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { BigNumberish } from 'ethers';

task('full:test:initialize', 'Initilize lending pool configuration.')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ pool }, BRE: HardhatRuntimeEnvironment) => {
    await BRE.run('set-DRE');
    const network = <eEthereumNetwork>BRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const { ReserveAssets, ReservesConfig, WNativeSymbol } = poolConfig as ICommonConfiguration;
    const reserveAssets = await getParamPerNetwork(ReserveAssets, network);
    const stableAndVariableDeployer = await getStableAndVariableTokensHelper();
    const atokenAndRatesDeployer = await getATokensAndRatesHelper();

    const addressProvider = await getLendingPoolAddressesProvider();
    const poolAddress = await addressProvider.getLendingPool();
    const incentivesController = '0xc6AA3eD49053567b3eE7fcD4206324974ED0bD89'; // deployed from incentive

    const tokensChunks = 3;
    const initChunks = 4;

    const reservesChunks = chunk(
      Object.entries(ReservesConfig).filter(
        ([_, { aTokenImpl }]) => aTokenImpl === eContractid.AToken
      ) as [string, IReserveParams][],
      tokensChunks
    );

    console.log('incentivesController====>', incentivesController);
    console.log(
      `- Token deployments in ${reservesChunks.length * 2} txs instead of ${
        Object.entries(ReservesConfig).length * 4
      } txs`
    );

    for (let reservesChunk of reservesChunks) {
      // Prepare data
      const tokens: string[] = [];
      const symbols: string[] = [];
      const strategyRates: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ][] = [];
      const reservesDecimals: string[] = [];

      for (let [assetSymbol, { reserveDecimals }] of reservesChunk) {
        const assetAddressIndex = Object.keys(reserveAssets).findIndex(
          (value) => value === assetSymbol
        );
        const [, tokenAddress] = (Object.entries(reserveAssets) as [string, string][])[
          assetAddressIndex
        ];

        const reserveParamIndex = Object.keys(ReservesConfig).findIndex(
          (value) => value === assetSymbol
        );
        const [
          ,
          {
            optimalUtilizationRate,
            baseVariableBorrowRate,
            variableRateSlope1,
            variableRateSlope2,
            stableRateSlope1,
            stableRateSlope2,
          },
        ] = (Object.entries(ReservesConfig) as [string, IReserveParams][])[reserveParamIndex];
        // Add to lists
        tokens.push(tokenAddress);
        // Rename WNATIVE to its real symbol
        symbols.push(assetSymbol == 'WNATIVE' ? WNativeSymbol : assetSymbol);
        strategyRates.push([
          optimalUtilizationRate,
          baseVariableBorrowRate,
          variableRateSlope1,
          variableRateSlope2,
          stableRateSlope1,
          stableRateSlope2,
        ]);
        reservesDecimals.push(reserveDecimals);
      }
      console.log('Chumk-->');
      console.log(reservesChunk);

      // // Deploy stable and variable deployers and save implementations
      // const tx1 = await waitForTx(
      //   await stableAndVariableDeployer.initDeployment(tokens, symbols, incentivesController)
      // );
      // tx1.events?.forEach((event, index) => {
      //   rawInsertContractAddressInDb(`stableDebt${symbols[index]}`, event?.args?.stableToken);
      //   rawInsertContractAddressInDb(`variableDebt${symbols[index]}`, event?.args?.variableToken);
      // });

      // // Deploy atokens and rate strategies and save implementations
      // const tx2 = await waitForTx(
      //   await atokenAndRatesDeployer.initDeployment(
      //     tokens,
      //     symbols,
      //     strategyRates,
      //     treasuryAddress,
      //     incentivesController
      //   )
      // );
      // tx2.events?.forEach((event, index) => {
      //   rawInsertContractAddressInDb(`ag${symbols[index]}`, event?.args?.aToken);
      //   rawInsertContractAddressInDb(`strategy${symbols[index]}`, event?.args?.strategy);
      // });

      // console.log(`  - Deployed aToken, DebtTokens and Strategy for: ${symbols.join(', ')} `);
      // console.log('    * gasUsed: debtTokens batch', tx1.gasUsed.toString());
      // console.log('    * gasUsed: aTokens and Strategy batch', tx2.gasUsed.toString());
      // gasUsage = gasUsage.add(tx1.gasUsed).add(tx2.gasUsed);

      // const stableTokens: string[] = tx1.events?.map((e) => e.args?.stableToken) || [];
      // const variableTokens: string[] = tx1.events?.map((e) => e.args?.variableToken) || [];
      // const aTokens: string[] = tx2.events?.map((e) => e.args?.aToken) || [];
      // const strategies: string[] = tx2.events?.map((e) => e.args?.strategy) || [];

      // deployedStableTokens = [...deployedStableTokens, ...stableTokens];
      // deployedVariableTokens = [...deployedVariableTokens, ...variableTokens];
      // deployedATokens = [...deployedATokens, ...aTokens];
      // deployedRates = [...deployedRates, ...strategies];
      // reserveInitDecimals = [...reserveInitDecimals, ...reservesDecimals];
      // reserveTokens = [...reserveTokens, ...tokens];
      // reserveSymbols = [...reserveSymbols, ...symbols];
    }

    // Deploy delegated aware reserves tokens
    const delegatedAwareReserves = Object.entries(ReservesConfig).filter(
      ([_, { aTokenImpl }]) => aTokenImpl === eContractid.DelegationAwareAToken
    ) as [string, IReserveParams][];

    for (let [symbol, params] of delegatedAwareReserves) {
      console.log(`  - Deploy ${symbol} delegation aware aToken, debts tokens, and strategy`);
      const {
        optimalUtilizationRate,
        baseVariableBorrowRate,
        variableRateSlope1,
        variableRateSlope2,
        stableRateSlope1,
        stableRateSlope2,
      } = params;
      // const deployCustomAToken = chooseATokenDeployment(params.aTokenImpl);
      // const aToken = await deployCustomAToken(
      //   [
      //     poolAddress,
      //     tokenAddresses[symbol],
      //     treasuryAddress,
      //     `Agave interest bearing ${symbol}`,
      //     `ag${symbol}`,
      //     ZERO_ADDRESS,
      //   ],
      //   verify
      // );
      // const stableDebt = await deployStableDebtToken(
      //   [
      //     poolAddress,
      //     tokenAddresses[symbol],
      //     `Agave stable debt bearing ${symbol}`,
      //     `stableDebt${symbol}`,
      //     ZERO_ADDRESS,
      //   ],
      //   verify
      // );
      // const variableDebt = await deployVariableDebtToken(
      //   [
      //     poolAddress,
      //     tokenAddresses[symbol],
      //     `Agave variable debt bearing ${symbol}`,
      //     `variableDebt${symbol}`,
      //     ZERO_ADDRESS,
      //   ],
      //   verify
      // );
      // const rates = await deployDefaultReserveInterestRateStrategy(
      //   [
      //     tokenAddresses[symbol],
      //     optimalUtilizationRate,
      //     baseVariableBorrowRate,
      //     variableRateSlope1,
      //     variableRateSlope2,
      //     stableRateSlope1,
      //     stableRateSlope2,
      //   ],
      //   verify
      // );

      // deployedStableTokens.push(stableDebt.address);
      // deployedVariableTokens.push(variableDebt.address);
      // deployedATokens.push(aToken.address);
      // deployedRates.push(rates.address);
      // reserveInitDecimals.push(params.reserveDecimals);
      // reserveTokens.push(tokenAddresses[symbol]);
      // reserveSymbols.push(symbol);
    }

    // Deploy init reserves per chunks
    // const chunkedStableTokens = chunk(deployedStableTokens, initChunks);
    // const chunkedVariableTokens = chunk(deployedVariableTokens, initChunks);
    // const chunkedAtokens = chunk(deployedATokens, initChunks);
    // const chunkedRates = chunk(deployedRates, initChunks);
    // const chunkedDecimals = chunk(reserveInitDecimals, initChunks);
    // const chunkedSymbols = chunk(reserveSymbols, initChunks);

    // console.log(
    //   chunkedStableTokens,
    //   chunkedVariableTokens,
    //   chunkedAtokens,
    //   chunkedRates,
    //   chunkedDecimals
    // );

    // console.log(`- Reserves initialization in ${chunkedStableTokens.length} txs`);
    // for (let chunkIndex = 0; chunkIndex < chunkedDecimals.length; chunkIndex++) {
    //   const tx3 = await waitForTx(
    //     await atokenAndRatesDeployer.initReserve(
    //       chunkedStableTokens[chunkIndex],
    //       chunkedVariableTokens[chunkIndex],
    //       chunkedAtokens[chunkIndex],
    //       chunkedRates[chunkIndex],
    //       chunkedDecimals[chunkIndex]
    //     )
    //   );

    //   console.log(`  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(', ')}`);
    //   console.log('    * gasUsed', tx3.gasUsed.toString());
    //   gasUsage = gasUsage.add(tx3.gasUsed);
    // }
  });
