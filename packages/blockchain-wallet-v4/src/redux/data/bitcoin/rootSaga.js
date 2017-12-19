
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { is } from 'ramda'
import { futurizeP } from 'futurize'
import Task from 'data.task'
import { sign } from '../../../signer'
import * as AT from './actionTypes'
import * as A from './actions'
import * as S from './selectors'
import * as selectors from '../../selectors'

export default ({ api } = {}) => {
  const taskToPromise = t => new Promise((resolve, reject) => t.fork(reject, resolve))

  const fetchFee = function * () {
    try {
      const response = yield call(api.getBitcoinFee)
      yield call(delay, 2000)
      yield put(A.fetchFeeSuccess(response))
    } catch (e) {
      yield put(A.fetchFeeFailure(e.message))
      throw e
    }
  }

  const fetchRates = function * () {
    try {
      const response = yield call(api.getBitcoinTicker)
      yield call(delay, 2000)
      yield put(A.fetchRatesSuccess(response))
    } catch (e) {
      yield put(A.fetchRatesFailure(e.message))
      throw e
    }
  }

  const fetchTransactions = function * ({ address, reset }) {
    try {
      const context = yield select(selectors.wallet.getWalletContext)
      const transactions = yield select(S.getTransactions)
      const offset = reset ? 0 : transactions.data.length
      const data = yield call(api.fetchBlockchainData, context, { n: 50, onlyShow: address, offset: offset })
      yield put(A.fetchTransactionsSuccess(data, reset))
    } catch (e) {
      yield put(A.fetchTransactionsFailure(e.message))
      throw e
    }
  }

  const fetchTransactionHistory = function * ({ address, start, end }) {
    try {
      const currency = yield select(selectors.settings.getCurrency)
      if (address) {
        const data = yield call(api.getTransactionHistory, address, currency, start, end)
        yield put(A.fetchTransactionHistorySuccess(data))
      } else {
        const context = yield select(selectors.wallet.getWalletContext)
        const active = context.join('|')
        const response = yield call(api.getTransactionHistory, active, currency, start, end)
        yield put(A.fetchTransactionHistorySuccess(response))
      }
    } catch (e) {
      yield put(A.fetchTransactionHistoryFailure(e.message))
      throw e
    }
  }

  const fetchFiatAtTime = function * ({ hash, amount, time }) {
    try {
      const currency = yield select(selectors.settings.getCurrency)
      const data = yield call(api.getBitcoinFiatAtTime, amount, currency, time)
      yield put(A.fetchFiatAtTimeSuccess({ currency: { hash: data } }))
    } catch (e) {
      yield put(A.fetchFiatAtTimeFailure(e.message))
      throw e
    }
  }

  const fetchUnspent = function * (index, address) {
    try {
      const source = is(Number, index) ? index : address
      const wrapper = yield select(selectors.wallet.getWrapper)
      const coins = yield call(api.getWalletUnspents, wrapper, source)
      yield put(A.fetchUnspentSuccess(coins))
    } catch (e) {
      yield put(A.fetchUnspentSuccess([]))
      throw e
    }
  }

  const publishTransaction = function * ({ network, selection, password }) {
    try {
      const wrapper = yield select(selectors.wallet.getWrapper)
      const signAndPublish = (sel, pass) => taskToPromise(sign(network, pass, wrapper, sel).chain(futurizeP(Task)(api.pushTx)))
      return yield call(signAndPublish, selection, password)
    } catch (e) {
      throw e
    }
  }

  return function * () {
    yield takeLatest(AT.FETCH_BITCOIN_FEE, fetchFee)
    yield takeLatest(AT.FETCH_BITCOIN_FIAT_AT_TIME, fetchFiatAtTime)
    yield takeLatest(AT.FETCH_BITCOIN_RATES, fetchRates)
    yield takeLatest(AT.FETCH_BITCOIN_TRANSACTIONS, fetchTransactions)
    yield takeLatest(AT.FETCH_BITCOIN_TRANSACTION_HISTORY, fetchTransactionHistory)
    yield takeLatest(AT.FETCH_BITCOIN_UNSPENT, fetchUnspent)
    yield takeLatest(AT.PUBLISH_BITCOIN_TRANSACTION, publishTransaction)
  }
}
