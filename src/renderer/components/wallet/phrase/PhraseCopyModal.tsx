import React from 'react'

import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import * as Styled from './PhraseCopyModal.style'

type Props = {
  visible: boolean
  phrase: string
  onClose?: FP.Lazy<void>
}

export const PhraseCopyModal: React.FC<Props> = (props): JSX.Element => {
  const { visible, phrase, onClose = FP.constVoid } = props

  const intl = useIntl()

  return (
    <Styled.Modal
      title={intl.formatMessage({ id: 'setting.view.phrase' })}
      visible={visible}
      onOk={onClose}
      onCancel={onClose}
      okText={intl.formatMessage({ id: 'common.copy' })}
      cancelText={intl.formatMessage({ id: 'common.cancel' })}>
      <Styled.PhraseView>
        {phrase.split(' ').map((item, index) => (
          <Styled.Item key={index}>{item}</Styled.Item>
        ))}
      </Styled.PhraseView>
      <Styled.CopyLabel copyable={{ text: phrase, icon: ['Copy', 'Copied'], tooltips: ['', ''] }} />
    </Styled.Modal>
  )
}
