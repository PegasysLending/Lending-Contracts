import { task } from 'hardhat/config';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { deployPegasysOracle, deployLendingRateOracle } from '../../helpers/contracts-deployments';
import { setInitialMarketRatesInRatesOracleByHelper } from '../../helpers/oracles-helpers';
import { ICommonConfiguration, eEthereumNetwork, SymbolMap } from '../../helpers/types';
import { waitForTx, notFalsyOrZeroAddress } from '../../helpers/misc-utils';
import {
  ConfigNames,
  loadPoolConfig,
  getWethAddress,
  getGenesisPoolAdmin,
  getLendingRateOracles,
  getWsysAddress,
} from '../../helpers/configuration';
import {
  getPegasysOracle,
  getLendingPoolAddressesProvider,
  getLendingRateOracle,
  getPairTokenIndexes,
} from '../../helpers/contracts-getters';
import { ZERO_ADDRESS } from '../../helpers/constants';

task('full:deploy-oracles', 'Deploy oracles for dev enviroment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ verify, pool }, DRE) => {
    try {
      await DRE.run('set-DRE');
      const network = <eEthereumNetwork>DRE.network.name;
      const poolConfig = loadPoolConfig(pool);
      const {
        ProtocolGlobalParams: { UsdAddress },
        ReserveAssets,
        ReservesConfig,
        FallbackOracle,
        ChainlinkAggregator,
      } = poolConfig as ICommonConfiguration;
      const lendingRateOracles = getLendingRateOracles(poolConfig);
      const addressesProvider = await getLendingPoolAddressesProvider();
      const admin = await getGenesisPoolAdmin(poolConfig);
      const PegasysOracleAddress = getParamPerNetwork(poolConfig.PegasysOracle, network);
      const lendingRateOracleAddress = getParamPerNetwork(poolConfig.LendingRateOracle, network);
      const fallbackOracleAddress = await getParamPerNetwork(FallbackOracle, network);
      const reserveAssets = await getParamPerNetwork(ReserveAssets, network);
      // const chainlinkAggregators = await getParamPerNetwork(ChainlinkAggregator, network);

      const tokensToWatch: SymbolMap<string> = {
        ...reserveAssets,
        // USD: UsdAddress,
      };
      // const [tokens, aggregators] = getPairsTokenAggregator(tokensToWatch, chainlinkAggregators);

      const tokens: string[] = [];
      const supraPairIds: number[] = [];
      const reserveDecimals: number[] = [];
      for (let symbol in tokensToWatch) {
        const reserveConfig = ReservesConfig[symbol];
        tokens.push(tokensToWatch[symbol]);
        supraPairIds.push(reserveConfig.supraPairId);
        reserveDecimals.push(reserveConfig.reserveDecimals);
      }

      const wnativeTokenAddress = getParamPerNetwork(poolConfig.WNATIVE, network);

      let oracle = getParamPerNetwork(poolConfig.SupraOracle, network);
      if (oracle == ZERO_ADDRESS) {
        throw 'Oracle address none，plz setting!';
      }

      const PegasysOracle = notFalsyOrZeroAddress(PegasysOracleAddress)
        ? await getPegasysOracle(PegasysOracleAddress)
        : await deployPegasysOracle(
            [
              tokens,
              supraPairIds,
              reserveDecimals,
              wnativeTokenAddress,
              fallbackOracleAddress,
              oracle,
            ],
            verify
          );

      const lendingRateOracle = notFalsyOrZeroAddress(lendingRateOracleAddress)
        ? await getLendingRateOracle(lendingRateOracleAddress)
        : await deployLendingRateOracle(verify);
      const { USD, ...tokensAddressesWithoutUsd } = tokensToWatch;

      if (!lendingRateOracleAddress) {
        await setInitialMarketRatesInRatesOracleByHelper(
          lendingRateOracles,
          tokensAddressesWithoutUsd,
          lendingRateOracle,
          admin
        );
      }

      // Register the proxy price provider on the addressesProvider
      await waitForTx(await addressesProvider.setPriceOracle(PegasysOracle.address));
      await waitForTx(await addressesProvider.setLendingRateOracle(lendingRateOracle.address));
    } catch (error) {
      throw error;
    }
  });
