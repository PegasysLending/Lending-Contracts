import { ethers } from 'hardhat';
import {
  AgaveProtocolDataProvider,
  ERC20,
  LendingPoolAddressesProvider,
  WETHGateway,
} from '../types';
import { expect } from 'chai';
import { getDb } from '../helpers/misc-utils';
import { eContractid } from '../helpers/types';

describe.only('Gateway withdraw', () => {
  it('Withdraw success', async () => {
    const [owner] = await ethers.getSigners();
    const gateway = (await ethers.getContractAt(
      'WETHGateway',
      '0x8962cf579fec336d8D92f73A50e69Efc156152cF'
      // await getDb().get(`${eContractid.WETHGateway}.main`).value().address
    )) as WETHGateway;
    expect(await gateway.getWETHAddress()).to.equal('0x65b28cBda2E2Ff082131549C1198DC9a50328186');
    expect(await gateway.getAWETHAddress()).to.equal(
      await getDb().get('agWSYS.main').value().address
    );
  });
});
