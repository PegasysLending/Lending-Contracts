import { task } from 'hardhat/config';
import {
  ConfigNames,
  getEmergencyAdmin,
  getGenesisPoolAdmin,
  loadPoolConfig,
} from '../../helpers/configuration';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { eEthereumNetwork } from '../../helpers/types';

task(
  'full:check:deploy-address-provider',
  'Deploy address provider, registry and fee provider for dev environment'
)
  .addFlag('verify', 'Verify contracts at Etherscan')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ verify, pool }, DRE: HardhatRuntimeEnvironment) => {
    await DRE.run('set-DRE');

    const poolConfig = loadPoolConfig(pool);
    const providerRegistryAddress = getParamPerNetwork(
      poolConfig.ProviderRegistry,
      eEthereumNetwork[DRE.network.name]
    );
    console.log('Provider Registry', providerRegistryAddress);
    const poolAdminAddress = await getGenesisPoolAdmin(poolConfig);
    console.log('Pool Admin', poolAdminAddress);
    const emergencyAdminAddress = await getEmergencyAdmin(poolConfig);
    console.log('Emergency Admin', emergencyAdminAddress);
  });
