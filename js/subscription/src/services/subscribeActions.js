const Web3 = require('web3')
const {abi} = require('../abi/SubscriptionContract.json')
require('dotenv').config() 
console.log(process.env);

const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/c4fe3240d0cb4071bf1ab8276b6160fa')) // TO DO remove it to .env file

const contractAddress = '0x812cA984a3BE1b7041A00FFc16405ad8827c011B'

export const getSizeOfSubscription = async() => {
  const subscriptionContract = new web3.eth.Contract(abi, contractAddress)
  const sizeOfSubscription =  await subscriptionContract.methods.getSizeOfSubscription().call()
  return sizeOfSubscription
}

export const getUserBalance = async(address) => {
  const subscriptionContract = new web3.eth.Contract(abi, contractAddress)
  const userBalance =  await subscriptionContract.methods.balanceOf(address).call()
  return userBalance
}

export const getLastMonthOfSubscription = async(address) => {
  const subscriptionContract = new web3.eth.Contract(abi, contractAddress)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  await subscriptionContract.methods.SubscriptionDate(address).call()
  let lastSubscriptionDate =  await subscriptionContract.methods.getUserSubscriptionDate().call()
  lastSubscriptionDate = new Date(lastSubscriptionDate * 1000)
  const lastMonthOfSubscription = months[lastSubscriptionDate.getMonth()]
  return lastMonthOfSubscription
}