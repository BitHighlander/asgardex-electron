import * as RD from '@devexperts/remote-data-ts'
import { WS, BinanceClient, Address, Client as BnbClient } from '@thorchain/asgardex-binance'
import { Asset, BNBChain } from '@thorchain/asgardex-util'
import * as F from 'fp-ts/function'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { map, mergeMap, catchError, retry, shareReplay, startWith, switchMap, debounceTime, tap } from 'rxjs/operators'
import * as RxOperators from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

import { BNB_DECIMAL } from '../../helpers/assetHelper'
import { getTransferFees, getFreezeFee } from '../../helpers/binanceHelper'
import { envOrDefault } from '../../helpers/envHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import { createClient } from '../client/client'
import { MAX_PAGINATION_ITEMS } from '../const'
import { ClientStateForViews } from '../types'
import { getClientStateForViews } from '../utils'
import { AssetsWithBalanceRD } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { createFreezeService } from './freeze'
import { createTransactionService } from './transaction'
import { BinanceClientState, FeeRD, FeesRD, TransferFeesRD, TxsRD, LoadTxsProps, BinanceClientState$ } from './types'

const BINANCE_TESTNET_WS_URI = envOrDefault(
  process.env.REACT_APP_BINANCE_TESTNET_WS_URI,
  'wss://testnet-dex.binance.org/api/ws'
)

const BINANCE_MAINET_WS_URI = envOrDefault(process.env.REACT_APP_BINANCE_MAINNET_WS_URI, 'wss://dex.binance.org/api/ws')

/**
 * Websocket endpoint depending on `Network`
 */
const wsEndpoint$ = network$.pipe(
  mergeMap((network) => {
    if (network === 'testnet') return Rx.of(BINANCE_TESTNET_WS_URI)
    // chaosnet + mainnet will use Binance mainet url
    return Rx.of(BINANCE_MAINET_WS_URI)
  })
)

/**
 * All types of incoming messages, which can be different
 */
type WSInMsg = WS.TransferEvent | WS.MiniTickersEvent

const ws$ = wsEndpoint$.pipe(map((endpoint) => webSocket<WSInMsg>(endpoint)))

/**
 * Observable for subscribing / unsubscribing transfers by given address
 * https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 *
 * Note: No need to serialize / deserialize messages.
 * By default `WebSocketSubjectConfig` is going to apply `JSON.parse` to each message comming from the Server.
 * and applies `JSON.stringify` by default to messages sending to the server.
 * @see https://rxjs-dev.firebaseapp.com/api/webSocket/WebSocketSubjectConfig#properties
 *
 * @param address Address to listen for transfers
 */
const subscribeTransfers = (address: string) => {
  const msg = {
    topic: 'transfers',
    address
  }
  return ws$.pipe(
    switchMap((ws) =>
      ws
        .multiplex(
          () => ({
            method: 'subscribe',
            ...msg
          }),
          () => ({
            method: 'unsubscribe',
            ...msg
          }),
          // filter out messages if data is not available
          (e) => (e as WS.TransferEvent).data !== undefined
        )
        .pipe(
          // Since we filtered messages before,
          // we know that data is available here, but it needs to be typed again
          map((event: WS.TransferEvent) => event.data as WS.Transfer)
        )
    )
  )
}

/**
 * JUST for DEBUGGING - we don't need a subscription of 'allTickers'
 *
 * Observable for subscribing / unsubscribing all tickers
 *
 * 24hr Ticker statistics for a all symbols are pushed every second.
 * https://docs.binance.org/api-reference/dex-api/ws-streams.html#11-all-symbols-mini-ticker-streams
 */

const allMiniTickersMsg = {
  topic: 'allMiniTickers',
  symbols: ['$all']
}

const miniTickers$ = ws$.pipe(
  switchMap((ws) =>
    ws
      .multiplex(
        () => ({
          method: 'subscribe',
          ...allMiniTickersMsg
        }),
        () => ({
          method: 'unsubscribe',
          ...allMiniTickersMsg
        }),
        // filter out messages if data is not available
        (e) => (e as WS.MiniTickersEvent).data !== undefined
      )
      .pipe(
        // Since we have filtered messages out before,
        // we know that `data` is available here,
        // but we have to do a type cast again
        map((event: WS.MiniTickersEvent) => event?.data as WS.MiniTickers)
      )
  )
)

const BINANCE_MAX_RETRY = 3

const newClient = createClient(
  BNBChain,
  ([keystore, network]) => {
    const client: BinanceClientState = F.pipe(
      getPhrase(keystore),
      O.chain((phrase) => {
        try {
          const client = new BnbClient({ phrase, network })
          return O.some(right(client)) as BinanceClientState
        } catch (error) {
          return O.some(left(error))
        }
      })
    )

    return client
  },
  BNB_DECIMAL
)

const reloadBalances = newClient.balances.reloadBalances

/**
 * Stream to create an observable BinanceClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new BinanceClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A BinanceClient will never be created as long as no phrase is available
 */
const clientState$: BinanceClientState$ = newClient.clientState$

const client$: Observable<O.Option<BinanceClient>> = newClient.client$

/**
 * Helper stream to provide "ready-to-go" state of latest `BinanceClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<ClientStateForViews> = clientState$.pipe(
  map((clientState) => getClientStateForViews(clientState))
)

/**
 * Current `Address` depending on selected network
 *
 * If a client is not available (e.g. by removing keystore), it returns `None`
 *
 */
const address$: Observable<O.Option<Address>> = newClient.address$

/**
 * State of `Balance`s provided as `AssetsWithBalanceRD`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const assetsWB$: Observable<AssetsWithBalanceRD> = newClient.balances.assetsWB$.pipe(tap(console.log))

const { get$: selectedAsset$, set: setSelectedAsset } = observableState<O.Option<Asset>>(O.none)

/**
 * Observable to load txs from Binance API endpoint
 * If client is not available, it returns an `initial` state
 */
const loadTxsOfSelectedAsset$ = ({
  client,
  oAsset,
  limit,
  offset
}: {
  client: BinanceClient
  oAsset: O.Option<Asset>
  limit: number
  offset: number
}): Observable<TxsRD> => {
  const txAsset = FP.pipe(
    oAsset,
    O.fold(
      () => undefined,
      (asset) => asset.symbol
    )
  )

  const endTime = Date.now()
  // 90 day window - similar to ASGARDEX wallet approach,
  // see https://gitlab.com/thorchain/asgard-wallet/-/blob/develop/imports/api/wallet.js#L39-48
  const diffTime = 90 * 24 * 60 * 60 * 1000
  const startTime = endTime - diffTime
  return Rx.from(client.getTransactions({ txAsset, endTime, startTime, limit, offset })).pipe(
    map(RD.success),
    catchError((error) => Rx.of(RD.failure(error))),
    startWith(RD.pending),
    retry(BINANCE_MAX_RETRY)
  )
}

const initialLoadTxsProps: LoadTxsProps = {
  limit: MAX_PAGINATION_ITEMS,
  offset: 0
}

// `TriggerStream` to reload `Txs`
const { get$: loadSelectedAssetTxs$, set: loadTxsSelectedAsset } = observableState<LoadTxsProps>(initialLoadTxsProps)

/**
 * State of `Txs`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const txsSelectedAsset$: Observable<TxsRD> = Rx.combineLatest(
  client$,
  loadSelectedAssetTxs$.pipe(debounceTime(300)),
  selectedAsset$
).pipe(
  switchMap(([client, { limit, offset }, oAsset]) => {
    return FP.pipe(
      // client and asset has to be available
      sequenceTOption(client, oAsset),
      O.fold(
        () => Rx.of(RD.initial as TxsRD),
        ([clientState, asset]) => loadTxsOfSelectedAsset$({ client: clientState, oAsset: O.some(asset), limit, offset })
      )
    )
  }),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

/**
 * Explorer url depending on selected network
 *
 * If a client is not available (e.g. by removing keystore), it returns `None`
 *
 */
const explorerUrl$: Observable<O.Option<string>> = client$.pipe(
  map(FP.pipe(O.map((client) => client.getExplorerUrl()))),
  shareReplay(1)
)

/**
 * Observable to load transaction fees from Binance API endpoint
 * If client is not available, it returns an `initial` state
 */
const loadFees$ = (client: BinanceClient): Observable<FeesRD> =>
  Rx.from(client.getFees()).pipe(
    map(RD.success),
    catchError((error) => Rx.of(RD.failure(error))),
    startWith(RD.pending),
    retry(BINANCE_MAX_RETRY)
  )

/**
 * Transaction fees
 * If a client is not available, it returns `None`
 */
const fees$: Observable<FeesRD> = client$.pipe(
  mergeMap(FP.pipe(O.fold(() => Rx.of(RD.initial), loadFees$))),
  shareReplay(1)
)

/**
 * Filtered fees to return `TransferFees` only
 */
const transferFees$: Observable<TransferFeesRD> = fees$.pipe(
  map((fees) =>
    FP.pipe(
      fees,
      RD.chain((fee) => RD.fromEither(getTransferFees(fee)))
    )
  ),
  shareReplay(1)
)

/**
 * Amount of feeze `Fee`
 */
const freezeFee$: Observable<FeeRD> = FP.pipe(
  fees$,
  liveData.map(getFreezeFee),
  liveData.chain(liveData.fromEither),
  shareReplay(1)
)

const wsTransfer$ = FP.pipe(
  address$,
  switchMap(O.fold(() => Rx.EMPTY, subscribeTransfers)),
  RxOperators.map(O.some),
  RxOperators.tap(O.map(reloadBalances)),
  RxOperators.startWith(O.none)
)

const transaction = createTransactionService(clientState$, wsTransfer$)

const freeze = createFreezeService(clientState$)

/**
 * Object with all "public" functions and observables
 */
export {
  miniTickers$,
  subscribeTransfers,
  client$,
  clientViewState$,
  assetsWB$,
  setSelectedAsset,
  reloadBalances,
  txsSelectedAsset$,
  loadTxsSelectedAsset,
  address$,
  selectedAsset$,
  explorerUrl$,
  transaction,
  freeze,
  transferFees$,
  freezeFee$
}
