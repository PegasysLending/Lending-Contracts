import { task } from 'hardhat/config';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import {
  deployLendingPoolCollateralManager,
  deployWalletBalancerProvider,
  deployPegasysProtocolDataProvider,
  deployWETHGateway,
} from '../../helpers/contracts-deployments';
import {
  loadPoolConfig,
  ConfigNames,
  getWethAddress,
  getTreasuryAddress,
} from '../../helpers/configuration';
import { eEthereumNetwork, ICommonConfiguration } from '../../helpers/types';
import { waitForTx } from '../../helpers/misc-utils';
import { initReservesByHelper, configureReservesByHelper } from '../../helpers/init-helpers';
import { exit } from 'process';
import {
  getPegasysProtocolDataProvider,
  getLendingPoolAddressesProvider,
} from '../../helpers/contracts-getters';
import { ZERO_ADDRESS } from '../../helpers/constants';

task('full:initialize-lending-pool', 'Initialize lending pool configuration.')
  .addFlag('verify', 'Verify contracts at Etherscan')
  // .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ verify, pool = 'Pegasys' }, localBRE) => {
    try {
      await localBRE.run('set-DRE');
      const network = <eEthereumNetwork>localBRE.network.name;
      const poolConfig = loadPoolConfig(pool);
      const { ReserveAssets, ReservesConfig, WNativeSymbol } = poolConfig as ICommonConfiguration;

      const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

      const addressesProvider = await getLendingPoolAddressesProvider();

      const testHelpers = await getPegasysProtocolDataProvider();

      const admin = await addressesProvider.getPoolAdmin();
      //
      if (!reserveAssets) {
        throw 'Reserve assets is undefined. Check ReserveAssets configuration at config directory';
      }

      const treasuryAddress = await getTreasuryAddress(poolConfig);

      const incentivesController = '0xc6AA3eD49053567b3eE7fcD4206324974ED0bD89'; // deployed from incentive

      const collateralManager = await deployLendingPoolCollateralManager(verify);
      await waitForTx(
        await addressesProvider.setLendingPoolCollateralManager(collateralManager.address)
      );

      // const wethAddress = await getWethAddress(poolConfig);
      const wethAddress = '0x65b28cBda2E2Ff082131549C1198DC9a50328186';
      const lendingPoolAddress = await addressesProvider.getLendingPool();

      // FIX HERE: WETHGateway agWETH from pool
      await deployWETHGateway([wethAddress, lendingPoolAddress]);

      await initReservesByHelper(
        ReservesConfig,
        reserveAssets,
        WNativeSymbol,
        admin,
        treasuryAddress,
        incentivesController,
        verify
      );

      await configureReservesByHelper(ReservesConfig, reserveAssets, testHelpers, admin);

      await deployWalletBalancerProvider(verify);
    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
