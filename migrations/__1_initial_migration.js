const Migrations = artifacts.require("SubscriptionContract");
const MigrationsToken = artifacts.require("DAI");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(MigrationsToken);
};