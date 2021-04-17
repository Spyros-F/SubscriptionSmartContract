const DaiToken = artifacts.require("DAI");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(DaiToken,'MYDAI', 'DAI');
};