import React, { useCallback, useState } from 'react'

import { storiesOf } from '@storybook/react'
import { bn, BaseAmount, AssetBNB, AssetBTC, assetAmount, assetToBase, AssetRuneNative } from '@xchainjs/xchain-util'

import { ZERO_BASE_AMOUNT } from '../../../../const'
import { AssetCard } from './AssetCard'

storiesOf('Components/Assets/AssetCard', module).add('default', () => {
  const [selectedAmount, setSelectedAmount] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [percent, setPercent] = useState(0)

  const onChangeAssetAmount = useCallback((value) => setSelectedAmount(value), [])
  const inputOnBlurHandler = () => console.log('onBlur')
  const inputOnFocusHandler = () => console.log('onFocus')

  const onChangePercent = useCallback((percent) => {
    console.log('percent', percent)
    setPercent(percent)
  }, [])

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetCard
        title="Title here"
        asset={AssetBNB}
        assets={[AssetBNB, AssetBTC, AssetRuneNative]}
        selectedAmount={selectedAmount}
        onChangeAssetAmount={onChangeAssetAmount}
        inputOnFocusHandler={inputOnFocusHandler}
        inputOnBlurHandler={inputOnBlurHandler}
        onChangePercent={onChangePercent}
        price={bn(600)}
        priceIndex={{
          RUNE: bn(1)
        }}
        percentValue={percent}
        maxAmount={assetToBase(assetAmount(10))}
      />
    </div>
  )
})
