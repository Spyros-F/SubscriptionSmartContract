const { expect, assert } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

// Load compiled artifacts
const subscriptionContract = artifacts.require('SubscriptionContract');
const daiContract = artifacts.require('DAI');

const helper = require('./utils/utils.js');

let instance;
let daiInstance;
const SECONDS_IN_DAY = 86400;

contract('SubscriptionContract', accounts => {

  beforeEach(async ()  => {
    daiInstance = await daiContract.new('MYDAI', 'DAI')
    instance = await subscriptionContract.new(20, accounts[2], daiInstance.address , {from:accounts[0]})
  })

  it('check that users initial balance is 0', async() => {
    const balance = await instance.balanceOf(accounts[1])
    assert.equal(balance.toString(), 0)
  })

  it('check that the owner can set subscription', async() => {
    await instance.setSizeOfSubscription(30, {from: accounts[0]})
    const sizeOfSubscription = await instance.sizeOfSubscription.call()
    assert.equal(sizeOfSubscription.toString(), 30)
  })

  it('check that only the owner can set subscription', async() => {
    await expectRevert(instance.setSizeOfSubscription(30, {from: accounts[1]}), "caller is not the owner")
  })

  it('test deposit with user balance 0', async() => {
    await expectRevert(instance.deposit(50, {from: accounts[1]}), "ERC20: transfer amount exceeds balance")
  })

  it('test deposit without allowance', async() => {
    await daiInstance.mint(accounts[1], 100)
    await expectRevert(instance.deposit(50, {from: accounts[1]}), "transfer amount exceeds allowance")
  })

  it('test deposit when user is not subscribed', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    const sizeOfSubscription = await instance.sizeOfSubscription.call()
    assert.equal(await instance.balanceOf(accounts[1]), 50 - sizeOfSubscription.toString())
  })

  it('test deposit when user is subscribed, first deposit user has not subscribe but in the second deposit he is already subscribed so he gets the whole deposit into his balance', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    const sizeOfSubscription = await instance.sizeOfSubscription.call()
    assert.equal(await instance.balanceOf(accounts[1]), 50 - sizeOfSubscription.toString())
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    assert.equal(await instance.balanceOf(accounts[1]), 100 - sizeOfSubscription.toString())
  })

  it('test subscribe function, user deposits without subscription, then he cancel his subscription and subscribes, the amount that we get at the end is what is supposed to be', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 70, {from: accounts[1]})
    await instance.deposit(70, {from: accounts[1]})
    const sizeOfSubscription = await instance.sizeOfSubscription.call()
    await instance.cancelSubscription({from: accounts[1]})
    await daiInstance.increaseAllowance(instance.address, sizeOfSubscription.toString(), {from: accounts[1]})
    await instance.subscribe({from: accounts[1]})
    const userBalance = await instance.balanceOf(accounts[1])
    const user = await instance.userInfo.call(accounts[1])
    assert.equal(userBalance.toString(), 30)
    assert.equal(user.subInfo.status, true)
  })

  it('test cancelSubscription function, users status must be false', async() => { 
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    await instance.cancelSubscription({from: accounts[1]})
    const userBalance = await instance.balanceOf(accounts[1])
    const user = await instance.userInfo.call(accounts[1])
    assert.equal(userBalance.toString(), 30)
    assert.equal(user.subInfo.status, false)
  })

  it('test hasSubscriptionExpired function, the user subscribes so must return false', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]}) //user has subscribed through deposit
    assert.equal(await instance.hasSubscriptionExpired(accounts[1]), false)
  })

  it('test hasSubscriptionExpired function, the users subscribes 31 days are passed so must return true', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    await helper.advanceTimeAndBlock(SECONDS_IN_DAY * 31);
    assert.equal(await instance.hasSubscriptionExpired(accounts[1]), true)
  })

  it('test updateSubscription function, users subscribes, subscription expires and updates it ', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    await helper.advanceTimeAndBlock(SECONDS_IN_DAY * 31);
    assert.equal(await instance.hasSubscriptionExpired(accounts[1]), true)
    await instance.updateSubscription(accounts[1])
    const balance = await instance.balanceOf(accounts[1])
    assert.equal(balance.toString(), 10)
  })

  it('test updateSubscription function, users subscribes, subscription expires and tries to update it but does not have money ', async() => {
    await daiInstance.mint(accounts[1], 100)
    const sizeOfSubscription = await instance.sizeOfSubscription.call()
    await daiInstance.increaseAllowance(instance.address, sizeOfSubscription.toString(), {from: accounts[1]})
    await instance.deposit(sizeOfSubscription.toString(), {from: accounts[1]})
    await helper.advanceTimeAndBlock(SECONDS_IN_DAY * 31);
    assert.equal(await instance.hasSubscriptionExpired(accounts[1]), true)
    await instance.updateSubscription(accounts[1])
    const user = await instance.userInfo.call(accounts[1])
    assert.equal(user.subInfo.status, false)
  })
})