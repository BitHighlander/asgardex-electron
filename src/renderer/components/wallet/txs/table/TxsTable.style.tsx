import { SwapOutlined } from '@ant-design/icons'
import * as A from 'antd'
import { Typography } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Table as UITable } from '../../../uielements/table'

export const Table = styled(UITable)`
  .ant-table-thead > tr > th {
    font-size: 16px;
    font-family: 'MainFontRegular';
    border: none;
    color: ${palette('gray', 2)};
  }

  .ant-table-tbody > tr > td {
    border: none;
  }
`

export const Text = styled(Typography.Text)`
  font-size: 16px;
  text-transform: lowercase;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
`

export const TransferIcon = styled(SwapOutlined)`
  svg {
    height: 20px;
    width: 20px;
    color: ${palette('text', 1)};
  }
`

export const CopyLabel = styled(A.Typography.Text)`
  text-transform: uppercase;
  color: ${palette('primary', 0)};
  svg {
    color: ${palette('primary', 0)};
  }
`
