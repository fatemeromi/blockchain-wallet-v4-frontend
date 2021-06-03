import React from 'react'
import { FormattedMessage } from 'react-intl'
import { add, lift, prop, propEq } from 'ramda'

import { coreSelectors } from 'blockchain-wallet-v4/src'
import { ADDRESS_TYPES } from 'blockchain-wallet-v4/src/redux/payment/btc/utils'
import { ExtractSuccess } from 'blockchain-wallet-v4/src/remote/types'
import { CoinType } from 'blockchain-wallet-v4/src/types'
import { createDeepEqualSelector } from 'blockchain-wallet-v4/src/utils'
import { CoinAccountSelectorType } from 'data/coins/types'
import { generateInterestAccount, generateTradingAccount } from 'data/coins/utils'
import { SwapAccountType } from 'data/components/types'

import { getInterestBalance, getTradingBalance } from '..'

// retrieves introduction text for coin on its transaction page
export const getTransactionPageHeaderText = () => (
  <FormattedMessage
    id='coins.btc.intro'
    defaultMessage='Bitcoin (BTC) is the original crypto and the internet’s premier digital currency.'
  />
)

// main selector for all BTC account types
// accepts a CoinAccountSelectorType config object
export const getAccounts = createDeepEqualSelector(
  [
    coreSelectors.wallet.getHDAccounts, // non-custodial accounts
    coreSelectors.data.btc.getAddresses, // non-custodial xpub info
    coreSelectors.common.btc.getActiveAddresses, // imported addresses
    coreSelectors.walletOptions.getSupportedCoins,
    (state, { coin }) => getTradingBalance(coin, state), // custodial accounts
    (state, { coin }) => getInterestBalance(coin, state), // custodial accounts
    (state, ownProps): CoinAccountSelectorType & { coin: CoinType } => ownProps // selector config
  ],
  (
    btcAccounts,
    btcDataR,
    importedAddressesR,
    supportedCoinsR,
    sbBalanceR,
    interestBalanceR,
    ownProps
  ) => {
    const transform = (
      btcData,
      importedAddresses,
      sbBalance: ExtractSuccess<typeof sbBalanceR>,
      interestBalance: ExtractSuccess<typeof interestBalanceR>,
      supportedCoins: ExtractSuccess<typeof supportedCoinsR>
    ) => {
      const { coin } = ownProps
      const config = supportedCoins[coin as CoinType]
      let accounts: SwapAccountType[] = []
      // add non-custodial accounts if requested
      if (ownProps?.nonCustodialAccounts) {
        // each account has a derivations object with legacy xpub and segwit xpub
        // need to extract each xpub for balance
        const xpubArray = (acc) => prop('derivations', acc).map((derr) => prop('xpub', derr))
        const xpubBalance = (acc) =>
          xpubArray(acc).map((xpub) => prop<string, any>('final_balance', prop(xpub, btcData)))
        accounts = accounts.concat(
          btcAccounts
            .map((acc) => ({
              accountIndex: prop('index', acc),
              address: prop('index', acc),
              archived: prop('archived', acc),
              // TODO: SEGWIT remove w/ DEPRECATED_V3
              balance: acc.derivations
                ? xpubBalance(acc).reduce(add, 0)
                : prop<string, any>('final_balance', prop(prop('xpub', acc), btcData)),
              baseCoin: coin,
              coin,
              config,
              label: prop('label', acc) || prop('xpub', acc),
              type: ADDRESS_TYPES.ACCOUNT
            }))
            .filter(propEq('archived', false))
        )
      }

      // add imported addresses if requested
      if (ownProps?.importedAddresses) {
        accounts = accounts.concat(
          importedAddresses.map((importedAcc) => ({
            address: importedAcc.addr,
            balance: importedAcc.info.final_balance,
            baseCoin: coin,
            coin,
            config,
            label: importedAcc.label || importedAcc.addr,
            type: ADDRESS_TYPES.LEGACY
          }))
        )
      }

      // add trading accounts if requested
      if (ownProps?.tradingAccounts) {
        accounts = accounts.concat(generateTradingAccount(coin, config, sbBalance))
      }

      // add interest accounts if requested
      if (ownProps?.interestAccounts) {
        accounts = accounts.concat(generateInterestAccount(coin, config, interestBalance))
      }
      return accounts
    }

    return lift(transform)(
      btcDataR,
      importedAddressesR,
      sbBalanceR,
      interestBalanceR,
      supportedCoinsR
    )
  }
)
