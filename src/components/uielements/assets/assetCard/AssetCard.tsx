import React, { useCallback, useRef, useState, RefObject } from 'react'

import { TokenAmount, tokenAmount } from '@thorchain/asgardex-token'
import { bn, delay, formatBN } from '@thorchain/asgardex-util'
import { Dropdown } from 'antd'
import BigNumber from 'bignumber.js'
import { sortBy as _sortBy } from 'lodash'

import { useClickOutside } from '../../../../hooks/useOutsideClick'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetPair } from '../../../../types/asgardex'
import CoinInputAdvanced from '../../coins/coinInputAdvanced'
import Label from '../../label'
import Selection from '../../selection'
import AssetMenu from '../assetMenu'
import {
  AssetCardFooter,
  AssetData,
  AssetNameLabel,
  CardBorderWrapper,
  CardTopRow,
  AssetCardWrapper,
  AssetDropdownButton,
  AssetDropdownAsset,
  AssetDropdownVerticalColumn,
  DropdownIcon,
  DropdownIconHolder,
  FooterLabel,
  HorizontalDivider
} from './AssetCard.style'

type DropdownCarretProps = {
  open: boolean
  onClick?: () => void
  className?: string
}
const DropdownCarret: React.FC<DropdownCarretProps> = ({ open, onClick = () => {}, className = '' }): JSX.Element => {
  const onClickHandler = useCallback(() => {
    onClick()
  }, [onClick])

  return (
    <DropdownIconHolder>
      <DropdownIcon open={open} className={className} type="caret-down" onClick={onClickHandler} />
    </DropdownIconHolder>
  )
}

type Props = {
  asset: string
  assetData?: AssetPair[]
  amount: TokenAmount
  price: BigNumber
  priceIndex?: PriceDataIndex
  unit?: string
  slip?: number
  title: string
  searchDisable?: string[]
  withSelection?: boolean
  withSearch?: boolean
  onSelect?: (value: number) => void
  onChange?: (value: BigNumber) => void
  onChangeAsset?: (asset: string) => void
  className?: string
  dataTestWrapper?: string
  dataTestInput?: string
  children?: React.ReactNode
}

const AssetCard: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    asset = 'bnb',
    assetData = [],
    amount = tokenAmount(0),
    price = bn(0),
    priceIndex,
    slip,
    unit = 'RUNE',
    className = '',
    title = '',
    withSelection = false,
    withSearch = false,
    searchDisable = [],
    onSelect = (_: number) => {},
    onChange = (_: BigNumber) => {},
    onChangeAsset = (_: string) => {},
    children = null
  } = props

  const [openDropdown, setOpenDropdown] = useState(false)
  const [percentButtonSelected, setPercentButtonSelected] = useState(0)
  const ref: RefObject<HTMLDivElement> = useRef(null)

  useClickOutside<HTMLDivElement>(ref, () => setOpenDropdown(false))

  const handleResetPercentButtons = () => {
    setPercentButtonSelected(0)
  }

  const handleDropdownButtonClicked = () => {
    // toggle open state
    setOpenDropdown((value) => !value)
  }

  const handlePercentSelected = (percentButtonSelected: number) => {
    setPercentButtonSelected(percentButtonSelected)
    onSelect(percentButtonSelected)
  }

  const handleChangeAsset = async (asset: string) => {
    setOpenDropdown(false)

    // Wait for the dropdown to close
    await delay(500)
    handleResetPercentButtons()
    onChangeAsset(asset)
  }

  function renderMenu() {
    const sortedAssetData = _sortBy(assetData, ['asset'])

    return (
      <AssetMenu
        assetData={sortedAssetData}
        asset={asset}
        priceIndex={priceIndex}
        unit={unit}
        withSearch={withSearch}
        searchDisable={searchDisable}
        onSelect={handleChangeAsset}
      />
    )
  }

  function renderDropDownButton() {
    const disabled = assetData.length === 0
    return (
      <AssetDropdownButton disabled={disabled} onClick={handleDropdownButtonClicked}>
        <AssetDropdownAsset type={asset} size="big" />
        {!disabled ? (
          <AssetDropdownVerticalColumn>
            <DropdownCarret className="caret-down" open={openDropdown} />
          </AssetDropdownVerticalColumn>
        ) : null}
      </AssetDropdownButton>
    )
  }
  return (
    <AssetCardWrapper ref={ref} className={`AssetCard-wrapper ${className}`}>
      {title && <Label className="title-label">{title}</Label>}

      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <CardBorderWrapper>
          <AssetNameLabel>{asset}</AssetNameLabel>
          <HorizontalDivider />
          <CardTopRow>
            <AssetData>
              <CoinInputAdvanced
                className="asset-amount-label"
                size="large"
                value={amount.amount()}
                onChangeValue={onChange}
              />
              <HorizontalDivider color="primary" />
              <AssetCardFooter>
                <FooterLabel>{`${unit} ${formatBN(amount.amount().multipliedBy(price))}`}</FooterLabel>
                {slip !== undefined && (
                  <FooterLabel className="asset-slip-label">SLIP: {slip.toFixed(0)} %</FooterLabel>
                )}
              </AssetCardFooter>
            </AssetData>
            {renderDropDownButton()}
          </CardTopRow>
        </CardBorderWrapper>
      </Dropdown>
      {withSelection && <Selection selected={percentButtonSelected} onSelect={handlePercentSelected} />}
      {children}
    </AssetCardWrapper>
  )
}

export default AssetCard