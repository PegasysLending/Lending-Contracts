import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ICommonConfiguration, SymbolMap, eEthereumNetwork } from '../../helpers/types';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import {
  getGenesisPoolAdmin,
  getLendingRateOracles,
  loadPoolConfig,
} from '../../helpers/configuration';

task('full:test:deploy-oracles', 'Deploy oracles for dev environment')
  .addParam('pool', `Pool name to retrieve configuration`)
  .setAction(async ({ verify, pool }, DRE: HardhatRuntimeEnvironment) => {
    await DRE.run('set-DRE');
    const network = <eEthereumNetwork>DRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const {
      ProtocolGlobalParams: { UsdAddress },
      ReserveAssets,
      FallbackOracle,
      ChainlinkAggregator,
    } = poolConfig as ICommonConfiguration;

    const admin = await getGenesisPoolAdmin(poolConfig);
    const reserveAssets = await getParamPerNetwork(ReserveAssets, network);
    const lendingRateOracles = getLendingRateOracles(poolConfig);
    const tokensToWatch: SymbolMap<string> = {
      ...reserveAssets,
      // USD: UsdAddress,
    };
    const { USD, ...tokensAddressesWithoutUsd } = tokensToWatch;

    console.log(tokensAddressesWithoutUsd);
    console.log(`Admin:${admin}`);
    console.log(`Rate Oracles:`);
    console.log(lendingRateOracles);
  });
