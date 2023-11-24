import { task } from 'hardhat/config';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { deployAgaveOracle, deployLendingRateOracle } from '../../helpers/contracts-deployments';
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
  getAgaveOracle,
  getLendingPoolAddressesProvider,
  getLendingRateOracle,
  getPairTokenIndexes,
} from '../../helpers/contracts-getters';

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
        FallbackOracle,
        ChainlinkAggregator,
      } = poolConfig as ICommonConfiguration;
      const lendingRateOracles = getLendingRateOracles(poolConfig);
      const addressesProvider = await getLendingPoolAddressesProvider();
      const admin = await getGenesisPoolAdmin(poolConfig);
      const AgaveOracleAddress = getParamPerNetwork(poolConfig.AgaveOracle, network);
      const lendingRateOracleAddress = getParamPerNetwork(poolConfig.LendingRateOracle, network);
      const fallbackOracleAddress = await getParamPerNetwork(FallbackOracle, network);
      const reserveAssets = await getParamPerNetwork(ReserveAssets, network);
      // const chainlinkAggregators = await getParamPerNetwork(ChainlinkAggregator, network);

      const tokensToWatch: SymbolMap<string> = {
        ...reserveAssets,
        USD: UsdAddress,
      };
      // const [tokens, aggregators] = getPairsTokenAggregator(tokensToWatch, chainlinkAggregators);

      const [tokens, indexes] = getPairTokenIndexes(network);

      // TODO
      let oracle: string;
      if (network == eEthereumNetwork.main) {
        // Mainnet
        oracle = '0x14Dbb98a8e9A77cE5B946145bb0194aDE5dA7611'//'0xcDD6be489D6Ef09bdc01A4d04AEA1e0c9Ef9d5BC';
      } else {
        throw 'Oracle address none，plz setting!'
      }

      const AgaveOracle = notFalsyOrZeroAddress(AgaveOracleAddress)
        ? await getAgaveOracle(AgaveOracleAddress)
        : await deployAgaveOracle(
            [tokens, indexes, await getWsysAddress(poolConfig), fallbackOracleAddress, oracle],
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
      await waitForTx(await addressesProvider.setPriceOracle(AgaveOracle.address));
      await waitForTx(await addressesProvider.setLendingRateOracle(lendingRateOracle.address));
    } catch (error) {
      throw error;
    }
  });
