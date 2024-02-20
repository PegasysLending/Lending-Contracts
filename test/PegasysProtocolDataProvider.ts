import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
  PegasysProtocolDataProvider,
  PegasysProtocolDataProviderFactory,
  LendingPool,
  LendingPoolAddressesProvider,
} from '../types';
import { getPegasysProtocolDataProvider } from '../helpers/contracts-getters';
import { eContractid } from '../helpers/types';
import { getDb } from '../helpers/misc-utils';
import { rawInsertContractAddressInDb } from '../helpers/contracts-helpers';

describe.only('PegasysProtocolDataProvider', function () {
  it.only('LendingPool should be', async () => {
    const [owner] = await ethers.getSigners();
    const pegasysProtocalDataProvider = PegasysProtocolDataProviderFactory.connect(
      await getDb().get(`${eContractid.PegasysProtocolDataProvider}.main`).value().address,
      owner
    );
    const addressesProviderAddress = await pegasysProtocalDataProvider.ADDRESSES_PROVIDER();
    const addressesProvider = (await ethers.getContractAt(
      'LendingPoolAddressesProvider',
      addressesProviderAddress
    )) as LendingPoolAddressesProvider;
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    const lendingPool = (await ethers.getContractAt(
      'LendingPool',
      lendingPoolAddress
    )) as LendingPool;
    const protocolTokens = Object();
    for (let t of Object.entries({
      WSYS: '0x65b28cBda2E2Ff082131549C1198DC9a50328186', // WSYS
      WBTC: '0x386aFa4cED76F3Ddd5D086599030fC21B7Ad9c10', // WBTC
      WETH: '0xFE0e902E5F363029870BDc871D27b0C9C46c8b80', // WETH
      USDT: '0xd270B0EdA02c6fEF5E213Bc99D4255B9eDd22617', // USDT
    })) {
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
      console.log(`ag${t[0]}`, reserveData.aTokenAddress);
      console.log(`strategy${t[0]}`, reserveData.interestRateStrategyAddress);
      console.log(`stableDebt${t[0]}`, reserveData.stableDebtTokenAddress);
      console.log(`variableDebt${t[0]}`, reserveData.variableDebtTokenAddress);

      protocolTokens[t[1]] = {
        symbol: t[0],
        ag: reserveData.aTokenAddress,
        variableDebt: reserveData.variableDebtTokenAddress,
        stableDebt: reserveData.stableDebtTokenAddress,
        strategy: reserveData.interestRateStrategyAddress,
        oracle: t[1],
      };
    }
    console.log('Place to the FE public/protocolTokens.json');
    console.log(JSON.stringify(protocolTokens));
  });
});
