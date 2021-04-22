const {abi} = require('../abi/DAI.json')
const {getWeb3Provider} = require('./provider')

export const createDaiInstance = async() => {
  const web3 = getWeb3Provider()
  const daiContractAddress = '0x062f0Ad407038F0d5CbDe953A55079569669aF28'
  const daiContract = new web3.eth.Contract(abi, daiContractAddress)
  return daiContract
}