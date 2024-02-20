import { task } from 'hardhat/config';
import { getPegasysProtocolDataProvider } from '../../helpers/contracts-getters';

task('print-config:fork', 'Deploy development enviroment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, DRE) => {
    await DRE.run('set-DRE');
    await DRE.run('pegasys:mainnet');

    const dataProvider = await getPegasysProtocolDataProvider();
    await DRE.run('print-config', { dataProvider: dataProvider.address, pool: 'Pegasys' });
  });
