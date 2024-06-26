import { task } from 'hardhat/config';
import {
  deployLendingPoolCollateralManager,
  deployMockFlashLoanReceiver,
  deployWalletBalancerProvider,
  deployPegasysProtocolDataProvider,
  deployWETHGateway,
} from '../../helpers/contracts-deployments';
import {
  ConfigNames,
  getReservesConfigByPool,
  getTreasuryAddress,
  getWethAddress,
  loadPoolConfig,
} from '../../helpers/configuration';

import { tEthereumAddress, PegasysPools, eContractid } from '../../helpers/types';
import { waitForTx, filterMapBy } from '../../helpers/misc-utils';
import { configureReservesByHelper, initReservesByHelper } from '../../helpers/init-helpers';
import { getAllTokenAddresses } from '../../helpers/mock-helpers';
import { ZERO_ADDRESS } from '../../helpers/constants';
import {
  getAllMockedTokens,
  getLendingPoolAddressesProvider,
} from '../../helpers/contracts-getters';
import { insertContractAddressInDb } from '../../helpers/contracts-helpers';

task('dev:initialize-lending-pool', 'Initialize lending pool configuration.')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');
    const poolConfig = loadPoolConfig(pool);

    const mockTokens = await getAllMockedTokens();
    const allTokenAddresses = getAllTokenAddresses(mockTokens);

    const addressesProvider = await getLendingPoolAddressesProvider();

    const protoPoolReservesAddresses = <{ [symbol: string]: tEthereumAddress }>(
      filterMapBy(allTokenAddresses, (key: string) => !key.includes('UNI_'))
    );

    const testHelpers = await deployPegasysProtocolDataProvider(addressesProvider.address, verify);

    const reservesParams = getReservesConfigByPool(PegasysPools.proto);

    const admin = await addressesProvider.getPoolAdmin();

    const treasuryAddress = await getTreasuryAddress(poolConfig);

    const incentivesController = '0x82Ba428bED73Dfa66c33169e09038F9786239e2D';

    await initReservesByHelper(
      reservesParams,
      protoPoolReservesAddresses,
      poolConfig.WNativeSymbol,
      admin,
      treasuryAddress,
      incentivesController,
      verify
    );
    await configureReservesByHelper(reservesParams, protoPoolReservesAddresses, testHelpers, admin);

    const collateralManager = await deployLendingPoolCollateralManager(verify);
    await waitForTx(
      await addressesProvider.setLendingPoolCollateralManager(collateralManager.address)
    );

    const mockFlashLoanReceiver = await deployMockFlashLoanReceiver(
      addressesProvider.address,
      verify
    );
    await insertContractAddressInDb(
      eContractid.MockFlashLoanReceiver,
      mockFlashLoanReceiver.address
    );

    await deployWalletBalancerProvider(verify);

    await insertContractAddressInDb(eContractid.PegasysProtocolDataProvider, testHelpers.address);

    const lendingPoolAddress = await addressesProvider.getLendingPool();
    const wethAddress = await getWethAddress(poolConfig);
    await deployWETHGateway([wethAddress, lendingPoolAddress]);
  });
