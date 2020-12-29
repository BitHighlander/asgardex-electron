import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { TxRD } from '../../../services/wallet/types'
import { TxTimer } from '../../uielements/txTimer'
import * as Styled from './TxModal.style'

export type Props = {
  txRD: TxRD
  title: string
  onClose: FP.Lazy<void>
  onViewTxClick?: (txHash: TxHash) => void
  maxSec?: number
  startTime?: number
  extra?: React.ReactNode
}

export const TxModal: React.FC<Props> = (props): JSX.Element => {
  const { title, txRD, startTime, onClose, onViewTxClick = FP.constVoid, extra = <></> } = props

  const intl = useIntl()

  const renderTimer = useMemo(
    () => (
      <Styled.SubContentRow>
        {FP.pipe(
          txRD,
          RD.fold(
            () => <TxTimer status={true} />,
            () => <TxTimer status={true} maxValue={100} startTime={startTime} />,
            (error) => <Styled.ErrorView subTitle={error?.msg || intl.formatMessage({ id: 'common.error' })} />,
            () => <TxTimer status={false} />
          )
        )}
      </Styled.SubContentRow>
    ),
    [intl, startTime, txRD]
  )

  const renderExtra = useMemo(() => <Styled.SubContentRow>{extra}</Styled.SubContentRow>, [extra])

  const renderResultDetails = useMemo(
    () => (
      <Styled.ResultDetailsContainer>
        <Styled.BtnCopyWrapper>
          <Styled.ViewButton disabled={RD.isInitial(txRD) || RD.isPending(txRD)} color="success" onClick={onClose}>
            {intl.formatMessage({ id: RD.isFailure(txRD) ? 'common.cancel' : 'common.finish' })}
          </Styled.ViewButton>

          {FP.pipe(
            txRD,
            RD.map((txHash) => (
              <Styled.ViewTxButton onClick={() => onViewTxClick(txHash)} key={txHash}>
                {intl.formatMessage({ id: 'common.viewTransaction' })}
              </Styled.ViewTxButton>
            )),
            RD.getOrElse(() => <></>)
          )}
        </Styled.BtnCopyWrapper>
      </Styled.ResultDetailsContainer>
    ),
    [intl, onClose, onViewTxClick, txRD]
  )

  return (
    <Styled.Modal visible title={title} footer={null} onCancel={onClose}>
      <Styled.ContentRow>
        {renderTimer}
        {renderExtra}
      </Styled.ContentRow>
      {renderResultDetails}
    </Styled.Modal>
  )
}