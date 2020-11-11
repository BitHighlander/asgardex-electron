import { WalletMessages } from '../types'

const wallet: WalletMessages = {
  'wallet.nav.stakes': 'Stakes',
  'wallet.nav.bonds': 'Bonds',
  'wallet.column.name': 'Name',
  'wallet.column.ticker': 'Ticker',
  'wallet.column.balance': 'Balance',
  'wallet.column.value': 'Value',
  'wallet.action.send': 'Send',
  'wallet.action.receive': 'Receive',
  'wallet.action.freeze': 'Freeze',
  'wallet.action.unfreeze': 'Unfreeze',
  'wallet.action.remove': 'Remove wallet',
  'wallet.action.unlock': 'Unlock',
  'wallet.action.connect': 'Connect',
  'wallet.action.import': 'Import',
  'wallet.action.create': 'Create',
  'wallet.connect.instruction': 'Please connect your wallet',
  'wallet.unlock.title': 'Unlock your wallet',
  'wallet.unlock.instruction': 'Please unlock your wallet',
  'wallet.unlock.phrase': 'Enter your your phrase',
  'wallet.unlock.error': 'Could not unlock the wallet. Please check you password and try it again',
  'wallet.imports.phrase': 'Phrase',
  'wallet.imports.wallet': 'Import existing wallet',
  'wallet.imports.enterphrase': 'Enter phrase',
  'wallet.txs.last90days': 'Transactions for last 90 days',
  'wallet.empty.phrase.import': 'Import an existing wallet with funds on it',
  'wallet.empty.phrase.create': 'Create a new wallet, and funds on it',
  'wallet.create.copy.phrase': 'Copy phrase below',
  'wallet.create.title': 'Create new wallet',
  'wallet.create.enter.phrase': 'Enter phrase correctly',
  'wallet.create.words.click': 'Click the word in correct order',
  'wallet.create.creating': 'Creating wallet',
  'wallet.create.password.repeat': 'Repeat password',
  'wallet.create.password.mismatch': 'Password mismatch',
  'wallet.create.error': 'Error while saving a phrase',
  'wallet.receive.address.error': 'No address available to receive funds',
  'wallet.receive.address.errorQR': 'Error while rendering QR code: {error}',
  'wallet.send.success': 'Transaction succeeded.',
  'wallet.send.fastest': 'Fastest',
  'wallet.send.fast': 'Fast',
  'wallet.send.average': 'Average',
  'wallet.errors.balancesFailed': 'Loading balances failed. {errorMsg} (API Id: {apiId})',
  'wallet.errors.address.empty': "Address can't be empty",
  'wallet.errors.address.invalid': 'Address is invalid',
  'wallet.errors.amount.shouldBeNumber': 'Amount should be a number',
  'wallet.errors.amount.shouldBeGreaterThan': 'Amount should be greater than {amount}',
  'wallet.errors.amount.shouldBeLessThanBalance': 'Amount should be less than your balance',
  'wallet.errors.amount.shouldBeLessThanFrozenBalance': 'Amount should be less than your frozen value',
  'wallet.errors.amount.shouldBeLessThanBalanceAndFee': 'Amount should be less than your balance minus fee',
  'wallet.errors.fee.notCovered': 'Fees are not covered by your balance ({balance})',
  'wallet.errors.invalidChain': 'Invalid chain: {chain}'
}

export default wallet
