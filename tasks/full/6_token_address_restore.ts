import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  PegasysProtocolDataProviderFactory,
  LendingPool,
  LendingPoolAddressesProvider,
} from '../../typechain';
import { eContractid, eEthereumNetwork } from '../../helpers/types';
import { getDb } from '../../helpers/misc-utils';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';

task('full:token_address_restore', 'Restore token addresses from LendingPool')
  .addParam(
    'pool',
    `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`,
    'Pegasys'
  )
  .setAction(async ({ pool }, localBRE: HardhatRuntimeEnvironment) => {
    await localBRE.run('set-DRE');
    const network = <eEthereumNetwork>localBRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const [owner] = await localBRE.ethers.getSigners();
    const pegasysProtocalDataProvider = PegasysProtocolDataProviderFactory.connect(
      await getDb().get(`${eContractid.PegasysProtocolDataProvider}.main`).value().address,
      owner
    );
    const addressesProviderAddress = await pegasysProtocalDataProvider.ADDRESSES_PROVIDER();
    const addressesProvider = (await localBRE.ethers.getContractAt(
      eContractid.LendingPoolAddressesProvider,
      addressesProviderAddress
    )) as LendingPoolAddressesProvider;
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    const lendingPool = (await localBRE.ethers.getContractAt(
      eContractid.LendingPool,
      lendingPoolAddress
    )) as LendingPool;
    for (let t of Object.entries(poolConfig.ReserveAssets[network])) {
      const reserveData = await lendingPool.getReserveData(t[1]);
      await getDb()
        .set(`ag${t[0]}.main`, {
          address: reserveData.aTokenAddress,
        })
        .write();
      await getDb()
        .set(`strategy${t[0]}.main`, {
          address: reserveData.interestRateStrategyAddress,
        })
        .write();
      await getDb()
        .set(`stableDebt${t[0]}.main`, {
          address: reserveData.stableDebtTokenAddress,
        })
        .write();
      await getDb().set(`variableDebt${t[0]}.main`, {
        address: reserveData.variableDebtTokenAddress,
      });
    }
  });
