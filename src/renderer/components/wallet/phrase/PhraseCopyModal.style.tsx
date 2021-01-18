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
  .ant-modal-footer,
  .cancel-ant-btn,
  .ok-ant-btn {
    display: none;
  }
`

export const CopyLabel = styled(A.Typography.Text)`
  display: block;
  width: fit-content;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  &,
  .ant-typography-copy {
    text-transform: uppercase;
    font-family: 'MainFontRegular';
    color: ${palette('primary', 0)} !important;
  }
`

export const PhraseView = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

export const Item = styled.div`
  width: 25%;
  min-width: 100px;
  text-align: center;
`
