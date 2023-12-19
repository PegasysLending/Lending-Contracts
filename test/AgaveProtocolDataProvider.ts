import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AgaveProtocolDataProvider, LendingPool, LendingPoolAddressesProvider } from '../types';
import { getAaveProtocolDataProvider } from '../helpers/contracts-getters';

describe('AgaveProtocolDataProvider', function () {
  it('LendingPool should be', async () => {
    const aaveProtocalDataProvider = await getAaveProtocolDataProvider();
    const addressesProviderAddress = await aaveProtocalDataProvider.ADDRESSES_PROVIDER();
    const addressesProvider = (await ethers.getContractAt(
      'LendingPoolAddressesProvider',
      addressesProviderAddress
    )) as LendingPoolAddressesProvider;
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    const lendingPool = (await ethers.getContractAt(
      'LendingPool',
      lendingPoolAddress
    )) as LendingPool;
    for (let t of [
      '0x65b28cBda2E2Ff082131549C1198DC9a50328186', // WSYS
      '0x386aFa4cED76F3Ddd5D086599030fC21B7Ad9c10', // WBTC
      '0xFE0e902E5F363029870BDc871D27b0C9C46c8b80', // WETH
      '0xd270B0EdA02c6fEF5E213Bc99D4255B9eDd22617', // USDT
    ]) {
      const reserveData = await lendingPool.getReserveData(t);
      console.log(reserveData);
    }
  });
});
