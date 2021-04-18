const SubscriptionContract = artifacts.require("SubscriptionContract");
const DaiToken = artifacts.require("DAI");

module.exports = function (deployer, networks, accounts) {
  await deployer.deploy(DaiToken, 'MYDAI', 'DAI')
  await deployer.deploy(SubscriptionContract, 20, accounts[2], DaiToken.address)
};