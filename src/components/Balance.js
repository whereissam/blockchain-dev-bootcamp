import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import dapp from '../assets/dapp.svg'

import {
  loadBalances,
  transferTokens
} from '../store/interactions'

const Balance = () => {
  const [token1TransferAmount, setToken1TransferAmount] = useState(0)

  const dispatch = useDispatch()

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)
  console.log(account)
  const exchange = useSelector(state => state.exchange.contract)
  console.log(exchange)
  const exchangeBalances = useSelector(state => state.exchange.balances)
  console.log(exchangeBalances)
  const transferInProgress = useSelector(state => state.exchange.transferInProgress)
  console.log(transferInProgress)

  const tokens = useSelector(state => state.tokens.contracts)
  const symbols = useSelector(state => state.tokens.symbols)
  console.log(tokens, symbols)
  const tokenBalances = useSelector(state => state.tokens.balances)
  console.log(tokenBalances)
  const amountHandler = (e, token) => {

    if (token.address === tokens[0].address) {
      // console.log(token)
      setToken1TransferAmount(e.target.value)
      // console.log(token1TransferAmount)
    }
  }

  //Step 1 : do transfer
  //Step 2 : Notify app that transfer is pending
  //Step 3 : Get confirmation from blockchain that transfer was successful
  //Step 4 : Notify app that transfer was successful
  //Step 5 : Handle transfer fails = notify app

  const depositHandler = (e, token) => {
    e.preventDefault()
    // console.log(token, tokens[0])
    if (token.address === tokens[0].address) {
      // console.log(exchange, token, token1TransferAmount)
      transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
      setToken1TransferAmount(0)
    }
  }

  // console.log(exchange, tokens[0], tokens[1], account)

  useEffect(() => {
    console.log(transferInProgress)
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch)
    }
  }, [exchange, tokens, account, transferInProgress])

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button className='tab tab--active'>Deposit</button>
          <button className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={dapp} alt="Token Logo" />{symbols && symbols[0]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
        </div>

        <form onSubmit={(e) => depositHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input
            type="text"
            id='token0'
            placeholder='0.0000'
            value={token1TransferAmount === 0 ? '' : token1TransferAmount}
            onChange={(e) => amountHandler(e, tokens[0])} />

          <button className='button' type='submit'>
            <span>Deposit</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>

        </div>

        <form>
          <label htmlFor="token1"></label>
          <input type="text" id='token1' placeholder='0.0000' />

          <button className='button' type='submit'>
            <span></span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  )
}

export default Balance