import { Currency, CurrencyAmount, Pair, Percent, Token } from '@cronaswap/core-sdk'
import React, { ReactNode, useCallback, useState } from 'react'
import { classNames, formatCurrencyAmount } from 'app/functions'

import Button from '../Button'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { CurrencyLogo } from '../CurrencyLogo'
import CurrencySearchModal from 'app/modals/SearchModal/CurrencySearchModal'
import DoubleCurrencyLogo from '../DoubleLogo'
import { FiatValue } from './FiatValue'
import Input from '../Input'
import Lottie from 'lottie-react'
import selectCoinAnimation from 'app/animations/select-coin.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from 'app/services/web3'
import { useCurrencyBalance } from 'app/states/wallet/hooks'
import { useLingui } from '@lingui/react'
import { useDashboardV2Contract } from 'app/hooks'
import { useSingleCallResult } from 'app/states/multicall/hooks'
import { parseUnits } from '@ethersproject/units'

interface CurrencyInputPanelProps {
  value?: string
  onUserInput?: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue?: CurrencyAmount<Token> | null
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
  allowManageTokenList?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  customBalanceText?: string
  showSearch?: boolean
  currencyList?: string[]
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  otherCurrency,
  id,
  showCommonBases,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  customBalanceText,
  allowManageTokenList = true,
  showSearch = true,
  currencyList = null,
}: CurrencyInputPanelProps) {
  const { i18n } = useLingui()
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const dashboardContract = useDashboardV2Contract()
  const currencyPrice = useSingleCallResult(dashboardContract, 'valueOfAsset', [
    currency?.isToken ? currency?.address : currency?.wrapped?.address,
    parseUnits('1', currency?.decimals),
  ])?.result

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <div
      id={id}
      className={classNames(
        hideInput ? 'p-4' : 'p-5',
        'rounded-xl bg-white dark:bg-gray-800 transition-all'
      )}
    >
      <div className="grid w-full gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs transition-all">
            <button
              type="button"
              className={classNames(
                !!currency ? 'text-gray-800' : 'text-white',
                'open-currency-select-button outline-none select-none cursor-pointer border-none text-xl font-medium items-center bg-gray-100 hover:bg-gray-100/80 dark:bg-gray-850 dark:hover:bg-gray-850/80 rounded-xl transition-all px-3 py-2'
              )}
              onClick={() => {
                if (onCurrencySelect) {
                  setModalOpen(true)
                }
              }}
            >
              <div className="flex items-center">
                {pair ? (
                  <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                ) : currency ? (
                  <div className="flex items-center">
                    <CurrencyLogo currency={currency} size={'24px'} />
                  </div>
                ) : (
                  <div
                    className="transition-all bg-white rounded-full dark:bg-gray-800"
                    style={{ maxWidth: 24, maxHeight: 24 }}
                  >
                    <div style={{ width: 24, height: 24 }}>
                      <Lottie animationData={selectCoinAnimation} autoplay loop />
                    </div>
                  </div>
                )}
                {pair ? (
                  <span
                    className={classNames(
                      'pair-name-container',
                      Boolean(currency && currency.symbol) ? 'text-sm' : 'text-sm'
                    )}
                  >
                    {pair?.token0.symbol}:{pair?.token1.symbol}
                  </span>
                ) : (
                  <div className="flex flex-1 flex-col items-start justify-center ml-1.5">
                    {label && (
                      <div className="hidden text-xs font-medium text-secondary whitespace-nowrap">{label}</div>
                    )}
                    <div className="flex items-center text-gray-800 transition-all dark:text-white">
                      <div className="text-sm font-bold token-symbol-container md:text-sm">
                        {(currency && currency.symbol && currency.symbol.length > 20
                          ? currency.symbol.slice(0, 4) +
                          '...' +
                          currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                          : currency?.symbol) || (
                            <div className="px-2 py-1 text-xs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap ">
                              {i18n._(t`Select a token`)}
                            </div>
                          )}
                      </div>

                      {!disableCurrencySelect && currency && (
                        <ChevronDownIcon width={16} height={16} className="ml-0.5 stroke-current" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </button>
            {currencyPrice && (
              <div className="text-[#303030] dark:text-[#868686] transition-all">
                {i18n._(t`~ $`)} {Number(currencyPrice?.valueInUSD?.toFixed(18)).toFixed(4)}
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-800 transition-all dark:text-white">
            {renderBalance ? (
              renderBalance(selectedCurrencyBalance)
            ) : (
              <>
                {i18n._(t`Balance:`)}{' '}
                <p className="mx-1 font-extrabold">{formatCurrencyAmount(selectedCurrencyBalance, 4)}</p>{' '}
                {currency?.symbol}
              </>
            )}
          </div>
        </div>
        {!hideInput && (
          <div
            className={classNames(
              'flex items-center w-full space-x-3 focus:bg-dark-700 px-5 py-3 bg-gray-100 dark:bg-gray-850 text-gray-800 dark:text-white placeholder-[#4B4B4B] rounded-md transition-all'
              // showMaxButton && selectedCurrencyBalance && 'px-3'
            )}
          >
            <>
              <Input.Numeric
                id="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
              {showMaxButton && selectedCurrencyBalance && (
                <Button
                  onClick={onMax}
                  size="xs"
                  className="text-xs font-bold transition-all bg-transparent rounded-full text-blue-special hover:text-blue-special/80 whitespace-nowrap"
                >
                  {i18n._(t`Max`)}
                </Button>
              )}
              {!hideBalance && currency && selectedCurrencyBalance ? (
                <div className="flex flex-col">
                  <div onClick={onMax} className="text-xs font-medium text-right cursor-pointer text-low-emphesis">
                    {
                      <div className="text-[#303030] dark:text-[#868686] transition-all">
                        {i18n._(t`~ $`)} {Number(currencyPrice?.valueInUSD?.toFixed(18) * Number(value)).toFixed(4)}
                      </div>
                    }
                  </div>
                  <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
                </div>
              ) : null}
            </>
          </div>
        )}
      </div>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          allowManageTokenList={allowManageTokenList}
          hideBalance={hideBalance}
          showSearch={showSearch}
          currencyList={currencyList}
        />
      )}
    </div>
  )
}
