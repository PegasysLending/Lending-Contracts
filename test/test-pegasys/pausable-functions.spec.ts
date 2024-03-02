import { makeSuite, TestEnv } from './helpers/make-suite';
import { ProtocolErrors, RateMode } from '../../helpers/types';
import { APPROVAL_AMOUNT_LENDING_POOL, oneEther } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'bignumber.js';
import { MockFlashLoanReceiver } from '../../typechain/MockFlashLoanReceiver';
import { getMockFlashLoanReceiver } from '../../helpers/contracts-getters';

const { expect } = require('chai');

makeSuite('Pausable Pool', (testEnv: TestEnv) => {
  // let _mockFlashLoanReceiver = {} as MockFlashLoanReceiver;

  const { LP_IS_PAUSED, INVALID_FROM_BALANCE_AFTER_TRANSFER, INVALID_TO_BALANCE_AFTER_TRANSFER } =
    ProtocolErrors;

  // before(async () => {
  //   _mockFlashLoanReceiver = await getMockFlashLoanReceiver();
  // });

  it('User 0 deposits 1000 wsys. Configurator pauses pool. Transfers to user 1 reverts. Configurator unpauses the network and next transfer succees', async () => {
    const { users, pool, wsys, aWSYS, configurator } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(wsys.address, '1000');

    await wsys.connect(users[0].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await wsys.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool
      .connect(users[0].signer)
      .deposit(wsys.address, amountDAItoDeposit, users[0].address, '0');

    const user0Balance = await aWSYS.balanceOf(users[0].address);
    const user1Balance = await aWSYS.balanceOf(users[1].address);

    // Configurator pauses the pool
    await configurator.connect(users[1].signer).setPoolPause(true);

    // User 0 tries the transfer to User 1
    await expect(
      aWSYS.connect(users[0].signer).transfer(users[1].address, amountDAItoDeposit)
    ).to.revertedWith(LP_IS_PAUSED);

    const pausedFromBalance = await aWSYS.balanceOf(users[0].address);
    const pausedToBalance = await aWSYS.balanceOf(users[1].address);

    expect(pausedFromBalance).to.be.equal(
      user0Balance.toString(),
      INVALID_TO_BALANCE_AFTER_TRANSFER
    );
    expect(pausedToBalance.toString()).to.be.equal(
      user1Balance.toString(),
      INVALID_FROM_BALANCE_AFTER_TRANSFER
    );

    // Configurator unpauses the pool
    await configurator.connect(users[1].signer).setPoolPause(false);

    // User 0 succeeds transfer to User 1
    await aWSYS.connect(users[0].signer).transfer(users[1].address, amountDAItoDeposit);

    const fromBalance = await aWSYS.balanceOf(users[0].address);
    const toBalance = await aWSYS.balanceOf(users[1].address);

    expect(fromBalance.toString()).to.be.equal(
      user0Balance.sub(amountDAItoDeposit),
      INVALID_FROM_BALANCE_AFTER_TRANSFER
    );
    expect(toBalance.toString()).to.be.equal(
      user1Balance.add(amountDAItoDeposit),
      INVALID_TO_BALANCE_AFTER_TRANSFER
    );
  });

  it('Deposit', async () => {
    const { users, pool, wsys, aWSYS, configurator } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(wsys.address, '1000');

    await wsys.connect(users[0].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await wsys.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    // Configurator pauses the pool
    await configurator.connect(users[1].signer).setPoolPause(true);
    await expect(
      pool.connect(users[0].signer).deposit(wsys.address, amountDAItoDeposit, users[0].address, '0')
    ).to.revertedWith(LP_IS_PAUSED);

    // Configurator unpauses the pool
    await configurator.connect(users[1].signer).setPoolPause(false);
  });

  it('Withdraw', async () => {
    const { users, pool, wsys, aWSYS, configurator } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(wsys.address, '1000');

    await wsys.connect(users[0].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await wsys.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool
      .connect(users[0].signer)
      .deposit(wsys.address, amountDAItoDeposit, users[0].address, '0');

    // Configurator pauses the pool
    await configurator.connect(users[1].signer).setPoolPause(true);

    // user tries to burn
    await expect(
      pool.connect(users[0].signer).withdraw(wsys.address, amountDAItoDeposit, users[0].address)
    ).to.revertedWith(LP_IS_PAUSED);

    // Configurator unpauses the pool
    await configurator.connect(users[1].signer).setPoolPause(false);
  });

  it('Borrow', async () => {
    const { pool, wsys, users, configurator } = testEnv;

    const user = users[1];
    // Pause the pool
    await configurator.connect(users[1].signer).setPoolPause(true);

    // Try to execute liquidation
    await expect(
      pool.connect(user.signer).borrow(wsys.address, '1', '1', '0', user.address)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause the pool
    await configurator.connect(users[1].signer).setPoolPause(false);
  });

  it('Repay', async () => {
    const { pool, wsys, users, configurator } = testEnv;

    const user = users[1];
    // Pause the pool
    await configurator.connect(users[1].signer).setPoolPause(true);

    // Try to execute liquidation
    await expect(
      pool.connect(user.signer).repay(wsys.address, '1', '1', user.address)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause the pool
    await configurator.connect(users[1].signer).setPoolPause(false);
  });

  // it('Flash loan', async () => {
  //   const { dai, pool, weth, users, configurator } = testEnv;

  //   const caller = users[3];

  //   const flashAmount = parseEther('0.8');

  //   await _mockFlashLoanReceiver.setFailExecutionTransfer(true);

  //   // Pause pool
  //   await configurator.connect(users[1].signer).setPoolPause(true);

  //   await expect(
  //     pool
  //       .connect(caller.signer)
  //       .flashLoan(
  //         _mockFlashLoanReceiver.address,
  //         [weth.address],
  //         [flashAmount],
  //         [1],
  //         caller.address,
  //         '0x10',
  //         '0'
  //       )
  //   ).revertedWith(LP_IS_PAUSED);

  //   // Unpause pool
  //   await configurator.connect(users[1].signer).setPoolPause(false);
  // });

  it('Liquidation call', async () => {
    const { users, pool, usdt: usdc, oracle, weth, configurator, helpersContract } = testEnv;
    const depositor = users[3];
    const borrower = users[4];

    //mints USDC to depositor
    await usdc
      .connect(depositor.signer)
      .mint(await convertToCurrencyDecimals(usdc.address, '1000'));

    //approve protocol to access depositor wallet
    await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 3 deposits 1000 USDC
    const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, '1000');

    await pool
      .connect(depositor.signer)
      .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0');

    //user 4 deposits 1 ETH
    const amountETHtoDeposit = await convertToCurrencyDecimals(weth.address, '1');

    //mints WETH to borrower
    await weth.connect(borrower.signer).mint(amountETHtoDeposit);

    //approve protocol to access borrower wallet
    await weth.connect(borrower.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(borrower.signer)
      .deposit(weth.address, amountETHtoDeposit, borrower.address, '0');

    //user 4 borrows
    const userGlobalData = await pool.getUserAccountData(borrower.address);

    const usdcPrice = await oracle.getAssetPrice(usdc.address);

    // we have disabled the stable borrow mode, now there's no test for it.
    // const amountUSDCToBorrow = await convertToCurrencyDecimals(
    //   usdc.address,
    //   new BigNumber(userGlobalData.availableBorrowsETH.toString())
    //     .div(usdcPrice.toString())
    //     .multipliedBy(0.9502)
    //     .toFixed(0)
    // );

    // await pool
    //   .connect(borrower.signer)
    //   .borrow(usdc.address, amountUSDCToBorrow, RateMode.Stable, '0', borrower.address);

    // Drops HF below 1
    await oracle.setAssetPrice(
      usdc.address,
      new BigNumber(usdcPrice.toString()).multipliedBy(1.2).toFixed(0)
    );

    //mints dai to the liquidator
    await usdc.mint(await convertToCurrencyDecimals(usdc.address, '1000'));
    await usdc.approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    const userReserveDataBefore = await helpersContract.getUserReserveData(
      usdc.address,
      borrower.address
    );

    const amountToLiquidate = new BigNumber(userReserveDataBefore.currentStableDebt.toString())
      .multipliedBy(0.5)
      .toFixed(0);

    // Pause pool
    await configurator.connect(users[1].signer).setPoolPause(true);

    // Do liquidation
    await expect(
      pool.liquidationCall(weth.address, usdc.address, borrower.address, amountToLiquidate, true)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause pool
    await configurator.connect(users[1].signer).setPoolPause(false);
  });

  it('SwapBorrowRateMode', async () => {
    const { pool, weth, wsys, usdt: usdc, users, configurator } = testEnv;
    const user = users[1];
    const amountWETHToDeposit = parseEther('10');
    const amountDAIToDeposit = parseEther('120');
    const amountToBorrow = parseUnits('65', 6);

    await weth.connect(user.signer).mint(amountWETHToDeposit);
    await weth.connect(user.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool.connect(user.signer).deposit(weth.address, amountWETHToDeposit, user.address, '0');

    await wsys.connect(user.signer).mint(amountDAIToDeposit);
    await wsys.connect(user.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool.connect(user.signer).deposit(wsys.address, amountDAIToDeposit, user.address, '0');

    await pool.connect(user.signer).borrow(usdc.address, amountToBorrow, 2, 0, user.address);

    // Pause pool
    await configurator.connect(users[1].signer).setPoolPause(true);

    // Try to repay
    await expect(
      pool.connect(user.signer).swapBorrowRateMode(usdc.address, RateMode.Stable)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause pool
    await configurator.connect(users[1].signer).setPoolPause(false);
  });

  it('RebalanceStableBorrowRate', async () => {
    const { pool, wsys, users, configurator } = testEnv;
    const user = users[1];
    // Pause pool
    await configurator.connect(users[1].signer).setPoolPause(true);

    await expect(
      pool.connect(user.signer).rebalanceStableBorrowRate(wsys.address, user.address)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause pool
    await configurator.connect(users[1].signer).setPoolPause(false);
  });

  it('setUserUseReserveAsCollateral', async () => {
    const { pool, weth, users, configurator } = testEnv;
    const user = users[1];

    const amountWETHToDeposit = parseEther('1');
    await weth.connect(user.signer).mint(amountWETHToDeposit);
    await weth.connect(user.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool.connect(user.signer).deposit(weth.address, amountWETHToDeposit, user.address, '0');

    // Pause pool
    await configurator.connect(users[1].signer).setPoolPause(true);

    await expect(
      pool.connect(user.signer).setUserUseReserveAsCollateral(weth.address, false)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause pool
    await configurator.connect(users[1].signer).setPoolPause(false);
  });
});
