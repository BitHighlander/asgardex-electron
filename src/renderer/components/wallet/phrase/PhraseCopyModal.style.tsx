import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Modal as BaseModal } from '../../uielements/modal'

export const Modal = styled(BaseModal)`
  .ant-modal-body {
    padding-top: 20px;
    padding-bottom: 20px;
    .ant-form-item {
      margin-bottom: 0;
    }
  }
  .ant-modal-footer {
    display: flex;
    justify-content: center;
  }
`

export const CopyLabel = styled(A.Typography.Text)`
  display: flex;
  place-items: center;
  &,
  .ant-typography-copy {
    text-transform: uppercase;
    font-family: 'MainFontRegular';
    color: ${palette('primary', 0)} !important;
  }
  svg {
    margin-left: 5px;
  }
`

export const PhraseView = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

export const Item = styled.div`
  position: relative;
  width: 25%;
  padding: 0px 20px;
  min-width: 120px;
  text-align: center;
`

export const Number = styled.div`
  position: absolute;
  top: -5px;
  right: 10px;
  font-size: 10px;
`
