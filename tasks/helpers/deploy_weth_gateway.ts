import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';
import { eEthereumNetwork } from '../../helpers/types';
import { ethers } from 'hardhat';
import { deployWETHGateway } from '../../helpers/contracts-deployments';
import { getLendingPoolAddressesProvider } from '../../helpers/contracts-getters';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';

task('full:fix-weth-gateway', 'Fix WETHGateway')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ pool }, BRE: HardhatRuntimeEnvironment) => {
    await BRE.run('set-DRE');
    const network = <eEthereumNetwork>BRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const addressesProvider = await getLendingPoolAddressesProvider();
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    const wnativeTokenAddress = getParamPerNetwork(poolConfig.WNATIVE, network);
    await deployWETHGateway([wnativeTokenAddress, lendingPoolAddress]);
  });
