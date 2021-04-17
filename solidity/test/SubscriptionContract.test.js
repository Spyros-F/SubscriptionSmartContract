const { expect, assert } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

// Load compiled artifacts
const subscriptionContract = artifacts.require('SubscriptionContract');
const daiContract = artifacts.require('DAI');

let instance;
let daiInstance;

contract('SubscriptionContract', accounts => {

  beforeEach(async ()  => {
    daiInstance = await daiContract.new('MYDAI', 'DAI')
    instance = await subscriptionContract.new(20, accounts[2], daiInstance.address , {from:accounts[0]})
  })

  it('test that subscription size is 20', async() => {
    assert.equal(await instance.getSizeOfSubscription(), 20)
  })

  it('check that users initial balance is 0', async() => {
    const balance = await instance.balanceOf(accounts[1])
    assert.equal(balance.toString(), 0)
  })

  it('check that the owner can set subscription', async() => {
    await instance.setSizeOfSubscription(30, {from: accounts[0]})
    assert.equal(await instance.getSizeOfSubscription(), 30)
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
    assert.equal(await instance.balanceOf(accounts[1]), 50 - await instance.getSizeOfSubscription())
  })

  it('test deposit when user is subscribed, first deposit user has not subscribe but in the second deposit he is already subscribed so he gets the whole deposit into his balance', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    assert.equal(await instance.balanceOf(accounts[1]), 50 - await instance.getSizeOfSubscription())
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    assert.equal(await instance.balanceOf(accounts[1]), 100 - await instance.getSizeOfSubscription())
  })

  it('test subscribe function, user deposits without subscription, then he cancel his subscription and subscribes, the amount that we get at the end is what is supposed to be', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 70, {from: accounts[1]})
    await instance.deposit(70, {from: accounts[1]})
    await daiInstance.increaseAllowance(instance.address, await instance.getSizeOfSubscription(), {from: await instance.getVaultAddress()})
    await instance.cancelSubscription({from: accounts[1]})

    await daiInstance.increaseAllowance(instance.address, await instance.getSizeOfSubscription(), {from: accounts[1]})
    await instance.subscribe({from: accounts[1]})
    const userBalance = await instance.balanceOf(accounts[1])
    assert.equal(userBalance.toString(), 50)
  })

  it('test cancelSubscription function, function getIsUserSubscribed must return false', async() => { 
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]})
    
    await daiInstance.increaseAllowance(instance.address, 50, {from: await instance.getVaultAddress()})
    await instance.cancelSubscription({from: accounts[1]})
    assert.equal(await instance.balanceOf(accounts[1]), 50)
    await instance.checkSubscription(accounts[1])
    assert.equal(await instance.getIsUserSubscribed(), false)
  })

  it('test checkSubscription function, the user subscribes so must return true', async() => {
    await daiInstance.mint(accounts[1], 100)
    await daiInstance.increaseAllowance(instance.address, 50, {from: accounts[1]})
    await instance.deposit(50, {from: accounts[1]}) //user has subscribed through deposit
    
    await instance.checkSubscription(accounts[1])
    assert.equal(await instance.getIsUserSubscribed(), true)
  })

  it('test checkSubscription function, the user has not subscribe so must return false', async() => {
    await instance.checkSubscription(accounts[1])
    assert.equal(await instance.getIsUserSubscribed(), false)
  })
})