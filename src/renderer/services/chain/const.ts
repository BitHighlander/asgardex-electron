import * as RD from '@devexperts/remote-data-ts'

import { AsymDepositState, SwapState, SymDepositState } from './types'

export const MAX_SWAP_STEPS = 3

export const INITIAL_SWAP_STATE: SwapState = {
  step: 1,
  swapTx: RD.initial,
  stepsTotal: MAX_SWAP_STEPS,
  swap: RD.initial
}

export const INITIAL_ASYM_DEPOSIT_STATE: AsymDepositState = {
  step: 1,
  depositTx: RD.initial,
  stepsTotal: 3,
  deposit: RD.initial
}

export const INITIAL_SYM_DEPOSIT_STATE: SymDepositState = {
  step: 1,
  stepsTotal: 4,
  depositTxs: { rune: RD.initial, asset: RD.initial },
  deposit: RD.initial
}
