import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { combineLatest } from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { sequenceTOption } from '../../helpers/fpHelpers'
import { liveData, LiveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { DefaultApi } from '../../types/generated/midgard/apis'
import { StakersAssetDataLD } from './types'

const createStakeService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi,
  selectedPoolAsset$: Rx.Observable<O.Option<Asset>>
) => {
  const api$ = byzantine$.pipe(map(RD.map(getMidgardDefaultApi)))

  const { get$: address$, set: setAddress } = observableState<O.Option<string>>(O.none)

  /**
   * `api.getStakersAddressAndAssetData` will return a new stream
   * and once http request is completed (resolved/failed) end
   * stream will be completed too and there will not be any
   * effects at the subscription callback as stream is completed.
   * That's why we need to create new stream via factory to have
   * a single stream per http request
   * @example /src/renderer/views/deposit/DepositView.tsx
   */
  const getStakes$ = (): StakersAssetDataLD =>
    FP.pipe(
      combineLatest([api$.pipe(map(RD.toOption)), address$, selectedPoolAsset$]),
      map(([oApi, oAddress, oSelectedAsset]) => sequenceTOption(oApi, oAddress, oSelectedAsset)),
      switchMap(
        O.fold(
          () => Rx.EMPTY,
          ([api, address, selectedAsset]) =>
            FP.pipe(
              api.getMemberDetail({ address }),
              map(({ pools }) => pools),
              map(A.findFirst((poolDetails) => poolDetails.pool === assetToString(selectedAsset)))
            )
        )
      ),
      map(O.fold(() => RD.initial, RD.success)),
      liveData.map((poolDetails) => ({
        asset: poolDetails.pool,
        assetStaked: poolDetails.assetAdded,
        assetWithdrawn: poolDetails.assetWithdrawn,
        dateFirstStaked: Number(poolDetails.dateFirstAdded),
        runeStaked: poolDetails.runeAdded,
        runeWithdrawn: poolDetails.runeWithdrawn,
        units: poolDetails.liquidityUnits
      })),
      catchError((e) => {
        /**
         * 404 response is returned in 2 cases:
         * 1. Pool doesn't exist at all
         * 2. User has no any stake units for the pool
         * In both cases return initial state as `No Data` identifier
         */
        if ('status' in e && e.status === 404) {
          return Rx.of(RD.initial)
        }

        /**
         * In all other cases return error as is
         */
        return Rx.of(RD.failure(Error(e)))
      }),
      startWith(RD.pending)
    )

  return {
    setAddress,
    getStakes$
  }
}

export { createStakeService }
