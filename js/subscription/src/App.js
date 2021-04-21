import React, {useState, useEffect} from 'react'
import {getSizeOfSubscription, getUserBalance, getLastMonthOfSubscription, depositAction, isUserSubscribed} from './services/subscribeActions'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import {useWeb3React} from '@web3-react/core'
import * as connectors from './connectors/connectors'
import AsyncButton from './ui-elements/asyncButton'
import styles from './styles'

const supportedProviders = [
  {
    title: 'Metamask',
    connector: () => connectors.injected
  },
]

const App = () => {
  const classes = styles()
  
  const [sizeOfSubscription, setSizeOfSubscription] = useState([])
  const [userBalanceOnContract, setUserBalanceOnContract] = useState([])
  const [lastMonthOfSubscription, setLastMonthOfSubscription] = useState('')
  const [value, setValue] = useState('')
  const {account, activate} = useWeb3React()
  const [providers] = useState(supportedProviders)
  const [isUserSubscriber, setIsUserSubscriber] = useState(false)
  const [btnDisable, setBtnDisable] = useState(true)
  const [loading, setLoading] = useState(false)

  const loadInfo = async () => {
    const sizeOfSubscription = await getSizeOfSubscription()
    setSizeOfSubscription(sizeOfSubscription)
  }
  
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => {
    if (account != null) {
      getUsersBalanceOnContract()
      getLastMonthSubscription()
      getIsUserSubscribed()
    }
  }, [account])

  const connectAccount = async() => {
    activate(providers[0].connector())
  }

  const getUsersBalanceOnContract = async() => {
    const userBalanceOnContract = await getUserBalance(account)
    setUserBalanceOnContract(userBalanceOnContract)
  }

  const getLastMonthSubscription = async() => {
    const lastMonthOfSubscription = await getLastMonthOfSubscription(account)
    setLastMonthOfSubscription(lastMonthOfSubscription)
  }

  const getIsUserSubscribed = async() => {
    const result = await isUserSubscribed(account)
    setIsUserSubscriber(result)
  }

  const onInputValueChange = event => {
    if(event.target.value !== '-' && Number(event.target.value) >= 0 && !Number.isNaN(event.target.value)) {
      setValue(event.target.value)
    }
    if(event.target.value === '') {
      setBtnDisable(true)
    } else {
      if (!isUserSubscriber && Number(event.target.value) < Number(sizeOfSubscription)) {
        setBtnDisable(true)
      } else {
        setBtnDisable(false)
      }
    }
  }

  const deposit = async() => {
    try{
      setLoading(true)
      const deposit = await depositAction(value, account)
      await getUsersBalanceOnContract()
      await getLastMonthSubscription()
      setLoading(false)
    } catch (e) {
      setLoading(false)
      console.log('spyros',loading)
    }
  }

  return (
    <div className="App">
      <Grid item >
        <Grid container alignItems='center' item xs={12} className={classes.sizeOfASubscriptionContainer} justify='center'>
          <Typography variant='subtitle2'>Size of Subscription:</Typography>
          <Typography variant='subtitle2' className={classes.sizeOfSubscriptionValue}>{sizeOfSubscription}</Typography>
        </Grid>
        <Grid container alignItems='center' item xs={12} className={classes.connectBtnContainer} justify='center'>
          <AsyncButton variant="contained" color="primary" onClick={() => connectAccount()}>Connect Account</AsyncButton>
        </Grid>
        {account? (
          <>
            <Grid container alignItems='center' item xs={12} className={classes.userBalanceContainer} justify='center'>
              <Typography variant='subtitle2'>User's balance in contract:</Typography>
              <Typography variant='subtitle2' className={classes.userBalanceValue}>{userBalanceOnContract}</Typography>
            </Grid>
            <Grid container alignItems='center' item xs={12} className={classes.usersLastMonthOfSubscriptionContainer} justify='center'>
              <Typography variant='subtitle2'>User's last month of subscription:</Typography>
              <Typography variant='subtitle2' className={classes.lastMonthValue}>{lastMonthOfSubscription? lastMonthOfSubscription : '-'}</Typography>
            </Grid>
            <Grid container alignItems='center' item xs={12} className={classes.inputContainer} justify='center'>
             <FormControl variant='outlined'>
              <OutlinedInput
                onChange={onInputValueChange}
                type='text'
                value={value}
                placeholder={'0'}
                />
              </FormControl>
              <AsyncButton onClick={() => deposit()}
                variant="contained" 
                color="primary" 
                className={classes.depositBtn}
                disabled={btnDisable}
                loading={loading}
              >
                Deposit
              </AsyncButton>
            </Grid>
          </>
        ): null}
      </Grid>
    </div>
  )
}

export default App;
