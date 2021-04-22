const {abi} = require('../abi/SubscriptionContract.json')
const {getCustomWeb3Provider} = require('./customProvider')
const {getWeb3Provider} = require('./provider')
const {createDaiInstance} = require('./daiContractInstance')

const contractAddress = '0x19370aB3B53CD374044CE5b18E713386eC2A3c13'

export const getSizeOfSubscription = async() => {
  const web3 = getCustomWeb3Provider()
  const subscriptionContract = new web3.eth.Contract(abi, contractAddress)
  const sizeOfSubscription = await subscriptionContract.methods.sizeOfSubscription().call()
  return web3.utils.fromWei(sizeOfSubscription.toString(),'ether')
}

export const getUserBalance = async(address) => {
  const web3 = getCustomWeb3Provider()
  const subscriptionContract = new web3.eth.Contract(abi, contractAddress)
  const userBalance =  await subscriptionContract.methods.balanceOf(address).call()
  return web3.utils.fromWei(userBalance,'ether')
}

export const getLastMonthOfSubscription = async(address) => {
  const web3 = getWeb3Provider()
  const subscriptionContract = new web3.eth.Contract(abi, contractAddress)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const user = await subscriptionContract.methods.userInfo(address).call()
  let lastSubscriptionDate =  user.subInfo.dateOfSubscription
  if (lastSubscriptionDate != 0) {
    lastSubscriptionDate = new Date(lastSubscriptionDate * 1000)
    const lastMonthOfSubscription = months[lastSubscriptionDate.getMonth()]
    return lastMonthOfSubscription
  }
  return ''
}

export const depositAction = async(amount, account) => {
  const web3 = getWeb3Provider()
  const Web3 = getCustomWeb3Provider()
  const subscriptionContract = new web3.eth.Contract(abi, contractAddress)
  const daiInstance = await createDaiInstance()
  await daiInstance.methods.mint(account, Web3.utils.toWei(amount,'ether')).send({from: account})
  await daiInstance.methods.increaseAllowance(contractAddress,  Web3.utils.toWei(amount,'ether')).send({from:account})
  await subscriptionContract.methods.deposit( Web3.utils.toWei(amount,'ether')).send({from: account})
}

export const isUserSubscribed = async(account) => {
  const web3 = getWeb3Provider()
  const subscriptionContract = new web3.eth.Contract(abi, contractAddress)
  const user = await subscriptionContract.methods.userInfo(account).call()
  const isUserSubscribed = user.subInfo.status
  return isUserSubscribed
}