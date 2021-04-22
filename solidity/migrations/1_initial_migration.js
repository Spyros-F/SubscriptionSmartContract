const Web3 = require('web3')

const SubscriptionContract = artifacts.require("SubscriptionContract")
const DaiToken = artifacts.require("DAI")
web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/c4fe3240d0cb4071bf1ab8276b6160fa'))

module.exports = async function (deployer, networks, accounts) {
  await deployer.deploy(DaiToken, 'MYDAI', 'DAI')
  await deployer.deploy(SubscriptionContract, web3.utils.toWei('20','ether'), accounts[2], DaiToken.address)
};