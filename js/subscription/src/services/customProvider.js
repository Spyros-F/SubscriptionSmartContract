const Web3 = require('web3')

let _web3 = null

export const getCustomWeb3Provider = () => {
  if(_web3 === null) {
    _web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/c4fe3240d0cb4071bf1ab8276b6160fa'))//TO DO read it from env file
  }

  return _web3
}