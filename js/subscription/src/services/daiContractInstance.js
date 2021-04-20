const {abi} = require('../abi/DAI.json')
const {getWeb3Provider} = require('./provider')

export const createDaiInstance = async() => {
  const web3 = getWeb3Provider()
  const daiContractAddress = '0xd4E636947ac5DDABeE59dBC5fdfceFC790922628'
  const daiContract = new web3.eth.Contract(abi, daiContractAddress)
  return daiContract
}