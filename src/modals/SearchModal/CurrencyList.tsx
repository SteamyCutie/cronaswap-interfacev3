import { Currency, CurrencyAmount, Token } from '@cronaswap/core-sdk'
import React, { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { RowBetween, RowFixed } from 'app/components/Row'

import { CurrencyLogo } from 'app/components/CurrencyLogo'
import { FixedSizeList } from 'react-window'
import ImportRow from './ImportRow'
import Loader from 'app/components/Loader'
import { MouseoverTooltip } from 'app/components/Tooltip'
import QuestionHelper from 'app/components/QuestionHelper'
import Typography from 'app/components/Typography'
import { WrappedTokenInfo } from 'app/states/lists/wrappedTokenInfo'
import { isTokenOnList } from 'app/functions/validate'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from 'app/services/web3'
import { useCombinedActiveList } from 'app/states/lists/hooks'
import { useCurrencyBalance } from 'app/states/wallet/hooks'
import { useIsUserAddedToken } from 'app/hooks/Tokens'
import { useLingui } from '@lingui/react'

function currencyKey(currency: Currency): string {
  return currency.isToken ? currency.address : 'ETHER'
}

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  // color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return (
    <div className="whitespace-nowrap overflow-hidden max-w-[5rem] overflow-ellipsis" title={balance.toExact()}>
      {balance.toSignificant(4)}
    </div>
  )
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const TokenListLogoWrapper = styled.img`
  height: 20px;
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  hideBalance = false,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  hideBalance: boolean
  style: CSSProperties
}) {
  const { account, chainId } = useActiveWeb3React()
  const key = currencyKey(currency)
  const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency.isToken ? currency : undefined)
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)
  // only show add or remove buttons if not on selected list
  return (
    <RowBetween
      id={`token-item-${key}`}
      style={style}
      className="px-4 py-1 transition-all bg-transparent rounded cursor-pointer dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <div className="flex flex-row items-center space-x-4">
        <div className="flex items-center">
          <CurrencyLogo currency={currency} size={32} />
        </div>
        <div>
          <div title={currency.name} className="text-sm font-extrabold">
            {currency.symbol}
          </div>
          <div className="text-xs font-thin truncate">
            {currency.name} {!isOnSelectedList && customAdded && '• Added by user'}
          </div>
        </div>
      </div>
      <TokenTags currency={currency} />
      <div className="flex items-center justify-end">
        {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
      </div>
    </RowBetween>
  )
}

const BREAK_LINE = 'BREAK'
type BreakLine = typeof BREAK_LINE
function isBreakLine(x: unknown): x is BreakLine {
  return x === BREAK_LINE
}

function BreakLineComponent({ style }: { style: CSSProperties }) {
  const { i18n } = useLingui()
  return (
    <FixedContentRow style={style}>
      <RowBetween>
        <RowFixed>
          <TokenListLogoWrapper src="/tokenlist.svg" />
          <Typography variant="sm" className="ml-3">
            {i18n._(t`Expanded results from inactive Token Lists`)}
          </Typography>
        </RowFixed>
        <QuestionHelper
          text={i18n._(t`Tokens from inactive lists. Import specific tokens below or
            click Manage to activate more lists.`)}
        />
      </RowBetween>
    </FixedContentRow>
  )
}

export default function CurrencyList({
  height,
  currencies,
  otherListTokens,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showImportView,
  setImportToken,
  hideBalance = false,
}: {
  height: number
  currencies: Currency[]
  otherListTokens?: WrappedTokenInfo[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showImportView: () => void
  setImportToken: (token: Token) => void
  hideBalance: boolean
}) {
  const itemData: (Currency | BreakLine)[] = useMemo(() => {
    if (otherListTokens && otherListTokens?.length > 0) {
      return [...currencies, BREAK_LINE, ...otherListTokens]
    }
    return currencies
  }, [currencies, otherListTokens])

  const Row = useCallback(
    function TokenRow({ data, index, style }) {
      const row: Currency | BreakLine = data[index]

      if (isBreakLine(row)) {
        return <BreakLineComponent style={style} />
      }

      const currency = row

      const isSelected = Boolean(currency && selectedCurrency && selectedCurrency.equals(currency))
      const otherSelected = Boolean(currency && otherCurrency && otherCurrency.equals(currency))
      const handleSelect = () => currency && onCurrencySelect(currency)

      const token = currency?.wrapped

      const showImport = index > currencies.length

      if (showImport && token) {
        return (
          <ImportRow style={style} token={token} showImportView={showImportView} setImportToken={setImportToken} dim />
        )
      } else if (currency) {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
            hideBalance={hideBalance}
          />
        )
      } else {
        return null
      }
    },
    [currencies.length, hideBalance, onCurrencySelect, otherCurrency, selectedCurrency, setImportToken, showImportView]
  )

  const itemKey = useCallback((index: number, data: typeof itemData) => {
    const currency = data[index]
    if (isBreakLine(currency)) return BREAK_LINE
    return currencyKey(currency)
  }, [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
