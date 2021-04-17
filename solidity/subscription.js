import web3 from './web3'
import SubscriptionContract from './build/contracts/SubscriptionContract.json'

const instance = new web3.eth.Contract(
  JSON.parse(SubscriptionContract.interface)
)
