import { ethers } from 'hardhat';
import {
  PegasysProtocolDataProvider,
  ERC20,
  LendingPoolAddressesProvider,
  WETHGateway,
} from '../typechain';
import { expect } from 'chai';
import { getDb } from '../helpers/misc-utils';
import { eContractid } from '../helpers/types';

describe('Gateway withdraw', () => {
  it('Withdraw success', async () => {
    const [owner] = await ethers.getSigners();
    const gateway = (await ethers.getContractAt(
      'WETHGateway',
      await getDb().get(`${eContractid.WETHGateway}.main`).value().address
    )) as WETHGateway;
    expect(await gateway.getWETHAddress()).to.equal('0x4200000000000000000000000000000000000006');
    expect(await gateway.getAWETHAddress()).to.equal(
      await getDb().get('agWSYS.main').value().address
    );
  });
});
