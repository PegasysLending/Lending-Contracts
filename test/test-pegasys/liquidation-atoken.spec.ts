import BigNumber from 'bignumber.js';

import { DRE } from '../../helpers/misc-utils';
import { APPROVAL_AMOUNT_LENDING_POOL, oneEther } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { makeSuite } from './helpers/make-suite';
import { ProtocolErrors, RateMode } from '../../helpers/types';
import { calcExpectedVariableDebtTokenBalance } from './helpers/utils/calculations';
import { getUserData, getReserveData } from './helpers/utils/helpers';

const chai = require('chai');
const { expect } = chai;

makeSuite('LendingPool liquidation - liquidator receiving aToken', (testEnv) => {
  const {
    LPCM_HEALTH_FACTOR_NOT_BELOW_THRESHOLD,
    INVALID_HF,
    LPCM_SPECIFIED_CURRENCY_NOT_BORROWED_BY_USER,
    LPCM_COLLATERAL_CANNOT_BE_LIQUIDATED,
    LP_IS_PAUSED,
  } = ProtocolErrors;

  it('Deposits WSYS, borrows WETH/Check liquidation fails because health factor is above 1', async () => {
    const { weth, wsys, users, pool, oracle } = testEnv;
    const depositor = users[0];
    const borrower = users[1];

    //mints WETH to depositor
    await weth
      .connect(depositor.signer)
      .mint(await convertToCurrencyDecimals(weth.address, '1000'));

    //approve protocol to access depositor wallet
    await weth.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 1000 WETH
    const amountWETHtoDeposit = await convertToCurrencyDecimals(weth.address, '1000');
    await pool
      .connect(depositor.signer)
      .deposit(weth.address, amountWETHtoDeposit, depositor.address, '0');

    // This value is depends on the config of the two tokens.
    const amountSYStoDeposit = await convertToCurrencyDecimals(wsys.address, '2670');

    //mints WSYS to borrower
    await wsys.connect(borrower.signer).mint(amountSYStoDeposit);

    //approve protocol to access borrower wallet
    await wsys.connect(borrower.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 2 deposits 2680 WSYS
    await pool
      .connect(borrower.signer)
      .deposit(wsys.address, amountSYStoDeposit, borrower.address, '0');

    //user 2 borrows
    const userGlobalData = await pool.getUserAccountData(borrower.address);
    const wethPrice = await oracle.getAssetPrice(weth.address);
    const totalCollater = userGlobalData.totalCollateralETH;
    const currentLtv = userGlobalData.ltv;

    const amountWETHToBorrow = await convertToCurrencyDecimals(
      weth.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(wethPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(weth.address, amountWETHToBorrow, RateMode.Variable, '0', borrower.address);

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address);

    expect(userGlobalDataAfter.currentLiquidationThreshold.toString()).to.be.bignumber.equal(
      '8250',
      'Invalid liquidation threshold'
    );

    //someone tries to liquidate user 2
    await expect(
      pool.liquidationCall(wsys.address, weth.address, borrower.address, 2680, true)
    ).to.be.revertedWith(LPCM_HEALTH_FACTOR_NOT_BELOW_THRESHOLD);
  });

  it('Drop the health factor below 1', async () => {
    const { weth, users, pool, oracle } = testEnv;
    const borrower = users[1];

    const wethPrice = await oracle.getAssetPrice(weth.address);

    await oracle.setAssetPrice(
      weth.address,
      new BigNumber(wethPrice.toString()).multipliedBy(1.15).toFixed(0)
    );

    const userGlobalData = await pool.getUserAccountData(borrower.address);

    expect(userGlobalData.healthFactor.toString()).to.be.bignumber.lt(
      oneEther.toString(),
      INVALID_HF
    );
  });

  it('Tries to liquidate a different currency than the loan principal', async () => {
    const { pool, users, wsys } = testEnv;
    const borrower = users[1];

    //user 2 tries to borrow
    await expect(
      pool.liquidationCall(wsys.address, wsys.address, borrower.address, oneEther.toString(), true)
    ).revertedWith(LPCM_SPECIFIED_CURRENCY_NOT_BORROWED_BY_USER);
  });

  it('Tries to liquidate a different collateral than the borrower collateral', async () => {
    const { pool, weth, users } = testEnv;
    const borrower = users[1];

    await expect(
      pool.liquidationCall(weth.address, weth.address, borrower.address, oneEther.toString(), true)
    ).revertedWith(LPCM_COLLATERAL_CANNOT_BE_LIQUIDATED);
  });

  it('Liquidates the borrow', async () => {
    const { pool, wsys, weth, aWETH, aWSYS, users, oracle, helpersContract, deployer } = testEnv;
    const borrower = users[1];

    //mints WETH to the caller

    await weth.mint(await convertToCurrencyDecimals(weth.address, '1000'));

    //approve protocol to access depositor wallet
    await weth.approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    const wethReserveDataBefore = await getReserveData(helpersContract, weth.address);
    const wsysReserveDataBefore = await helpersContract.getReserveData(wsys.address);

    const userReserveDataBefore = await getUserData(
      pool,
      helpersContract,
      weth.address,
      borrower.address
    );

    const amountToLiquidate = new BigNumber(userReserveDataBefore.currentVariableDebt.toString())
      .div(2)
      .toFixed(0);

    const tx = await pool.liquidationCall(
      wsys.address,
      weth.address,
      borrower.address,
      amountToLiquidate,
      true
    );

    const userReserveDataAfter = await helpersContract.getUserReserveData(
      weth.address,
      borrower.address
    );

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address);

    const wethReserveDataAfter = await helpersContract.getReserveData(weth.address);
    const wsysReserveDataAfter = await helpersContract.getReserveData(wsys.address);

    const collateralPrice = (await oracle.getAssetPrice(wsys.address)).toString();
    const principalPrice = (await oracle.getAssetPrice(weth.address)).toString();

    const collateralDecimals = (
      await helpersContract.getReserveConfigurationData(wsys.address)
    ).decimals.toString();
    const principalDecimals = (
      await helpersContract.getReserveConfigurationData(weth.address)
    ).decimals.toString();

    const expectedCollateralLiquidated = new BigNumber(principalPrice)
      .times(new BigNumber(amountToLiquidate).times(105))
      .times(new BigNumber(10).pow(collateralDecimals))
      .div(new BigNumber(collateralPrice).times(new BigNumber(10).pow(principalDecimals)))
      .decimalPlaces(0, BigNumber.ROUND_DOWN);

    if (!tx.blockNumber) {
      expect(false, 'Invalid block number');
      return;
    }

    const txTimestamp = new BigNumber(
      (await DRE.ethers.provider.getBlock(tx.blockNumber)).timestamp
    );

    const variableDebtBeforeTx = calcExpectedVariableDebtTokenBalance(
      wethReserveDataBefore,
      userReserveDataBefore,
      txTimestamp
    );

    expect(userGlobalDataAfter.healthFactor.toString()).to.be.bignumber.gt(
      oneEther.toFixed(0),
      'Invalid health factor'
    );

    expect(userReserveDataAfter.currentVariableDebt.toString()).to.be.bignumber.almostEqual(
      new BigNumber(variableDebtBeforeTx).minus(amountToLiquidate).toFixed(0),
      'Invalid user borrow balance after liquidation'
    );

    expect(wethReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      new BigNumber(wethReserveDataBefore.availableLiquidity.toString())
        .plus(amountToLiquidate)
        .toFixed(0),
      'Invalid principal available liquidity'
    );

    //the liquidity index of the principal reserve needs to be bigger than the index before
    expect(wethReserveDataAfter.liquidityIndex.toString()).to.be.bignumber.gte(
      wethReserveDataBefore.liquidityIndex.toString(),
      'Invalid liquidity index'
    );

    //the principal APY after a liquidation needs to be lower than the APY before
    expect(wethReserveDataAfter.liquidityRate.toString()).to.be.bignumber.lt(
      wethReserveDataBefore.liquidityRate.toString(),
      'Invalid liquidity APY'
    );

    expect(wsysReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      new BigNumber(wsysReserveDataBefore.availableLiquidity.toString()).toFixed(0),
      'Invalid collateral available liquidity'
    );

    expect(
      (await helpersContract.getUserReserveData(wsys.address, deployer.address))
        .usageAsCollateralEnabled
    ).to.be.true;
  });

  // Stable mode is disabled. There's no need to test it
  // it('User 3 deposits 1000 USDC, user 4 1 WETH, user 4 borrows - drops HF, liquidates the borrow', async () => {
  //   const { users, pool, usdt, oracle, weth, helpersContract } = testEnv;
  //   const depositor = users[3];
  //   const borrower = users[4];

  //   //mints USDC to depositor
  //   await usdt
  //     .connect(depositor.signer)
  //     .mint(await convertToCurrencyDecimals(usdt.address, '1000'));

  //   //approve protocol to access depositor wallet
  //   await usdt.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

  //   //user 3 deposits 1000 USDC
  //   const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdt.address, '1000');

  //   await pool
  //     .connect(depositor.signer)
  //     .deposit(usdt.address, amountUSDCtoDeposit, depositor.address, '0');

  //   //user 4 deposits 1 ETH
  //   const amountETHtoDeposit = await convertToCurrencyDecimals(weth.address, '1');

  //   //mints WETH to borrower
  //   await weth.connect(borrower.signer).mint(amountETHtoDeposit);

  //   //approve protocol to access borrower wallet
  //   await weth.connect(borrower.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

  //   await pool
  //     .connect(borrower.signer)
  //     .deposit(weth.address, amountETHtoDeposit, borrower.address, '0');

  //   //user 4 borrows
  //   const userGlobalData = await pool.getUserAccountData(borrower.address);

  //   const usdcPrice = await oracle.getAssetPrice(usdt.address);

  //   const amountUSDCToBorrow = await convertToCurrencyDecimals(
  //     usdt.address,
  //     new BigNumber(userGlobalData.availableBorrowsETH.toString())
  //       .div(usdcPrice.toString())
  //       .multipliedBy(0.9502)
  //       .toFixed(0)
  //   );

  //   await pool
  //     .connect(borrower.signer)
  //     .borrow(usdt.address, amountUSDCToBorrow, RateMode.Stable, '0', borrower.address);

  //   //drops HF below 1

  //   await oracle.setAssetPrice(
  //     usdt.address,
  //     new BigNumber(usdcPrice.toString()).multipliedBy(1.12).toFixed(0)
  //   );

  //   //mints dai to the liquidator

  //   await usdt.mint(await convertToCurrencyDecimals(usdt.address, '1000'));

  //   //approve protocol to access depositor wallet
  //   await usdt.approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

  //   const userReserveDataBefore = await helpersContract.getUserReserveData(
  //     usdt.address,
  //     borrower.address
  //   );

  //   const usdcReserveDataBefore = await helpersContract.getReserveData(usdt.address);
  //   const ethReserveDataBefore = await helpersContract.getReserveData(weth.address);

  //   const amountToLiquidate = new BigNumber(userReserveDataBefore.currentStableDebt.toString())
  //     .multipliedBy(0.5)
  //     .toFixed(0);

  //   await pool.liquidationCall(
  //     weth.address,
  //     usdt.address,
  //     borrower.address,
  //     amountToLiquidate,
  //     true
  //   );

  //   const userReserveDataAfter = await helpersContract.getUserReserveData(
  //     usdt.address,
  //     borrower.address
  //   );

  //   const userGlobalDataAfter = await pool.getUserAccountData(borrower.address);

  //   const usdcReserveDataAfter = await helpersContract.getReserveData(usdt.address);
  //   const ethReserveDataAfter = await helpersContract.getReserveData(weth.address);

  //   const collateralPrice = (await oracle.getAssetPrice(weth.address)).toString();
  //   const principalPrice = (await oracle.getAssetPrice(usdt.address)).toString();

  //   const collateralDecimals = (
  //     await helpersContract.getReserveConfigurationData(weth.address)
  //   ).decimals.toString();
  //   const principalDecimals = (
  //     await helpersContract.getReserveConfigurationData(usdt.address)
  //   ).decimals.toString();

  //   const expectedCollateralLiquidated = new BigNumber(principalPrice)
  //     .times(new BigNumber(amountToLiquidate).times(105))
  //     .times(new BigNumber(10).pow(collateralDecimals))
  //     .div(new BigNumber(collateralPrice).times(new BigNumber(10).pow(principalDecimals)))
  //     .decimalPlaces(0, BigNumber.ROUND_DOWN);

  //   expect(userGlobalDataAfter.healthFactor.toString()).to.be.bignumber.gt(
  //     oneEther.toFixed(0),
  //     'Invalid health factor'
  //   );

  //   expect(userReserveDataAfter.currentStableDebt.toString()).to.be.bignumber.almostEqual(
  //     new BigNumber(userReserveDataBefore.currentStableDebt.toString())
  //       .minus(amountToLiquidate)
  //       .toFixed(0),
  //     'Invalid user borrow balance after liquidation'
  //   );

  //   expect(usdcReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
  //     new BigNumber(usdcReserveDataBefore.availableLiquidity.toString())
  //       .plus(amountToLiquidate)
  //       .toFixed(0),
  //     'Invalid principal available liquidity'
  //   );

  //   //the liquidity index of the principal reserve needs to be bigger than the index before
  //   expect(usdcReserveDataAfter.liquidityIndex.toString()).to.be.bignumber.gte(
  //     usdcReserveDataBefore.liquidityIndex.toString(),
  //     'Invalid liquidity index'
  //   );

  //   //the principal APY after a liquidation needs to be lower than the APY before
  //   expect(usdcReserveDataAfter.liquidityRate.toString()).to.be.bignumber.lt(
  //     usdcReserveDataBefore.liquidityRate.toString(),
  //     'Invalid liquidity APY'
  //   );

  //   expect(ethReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
  //     new BigNumber(ethReserveDataBefore.availableLiquidity.toString()).toFixed(0),
  //     'Invalid collateral available liquidity'
  //   );
  // });
});
