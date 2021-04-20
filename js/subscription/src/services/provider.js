const Web3 = require('web3')

let _web3 = null

const initWeb3Provider = (provider) => {
  _web3 = new Web3(provider)
}

export const getWeb3Provider = () => {
  if(_web3 === null) {
    throw new Error('Provider not instantiated')
  }

  return _web3
}

export const setProvider = provider => {
  initWeb3Provider(provider)
}