import React, { createContext, useContext } from 'react'

import { client$, address$ } from '../services/ethereum/service'

export type EthereumContextValue = {
  client$: typeof client$
  address$: typeof address$
}

const initialContext: EthereumContextValue = {
  client$,
  address$
}

const EthereumContext = createContext<EthereumContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const EthereumProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
  return <EthereumContext.Provider value={initialContext}>{children}</EthereumContext.Provider>
}

export const useEthereumContext = () => {
  const context = useContext(EthereumContext)
  if (!context) {
    throw new Error('Context must be used within a EthereumProvider.')
  }
  return context
}
