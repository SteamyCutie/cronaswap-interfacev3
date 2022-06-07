import { ChainId, Currency, Token, currencyEquals } from '@cronaswap/core-sdk'

import Button from 'app/components/Button'
import { COMMON_BASES } from 'app/configs/routing'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import QuestionHelper from 'app/components/QuestionHelper'
import React from 'react'
import Typography from 'app/components/Typography'
import { currencyId } from 'app/functions'

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
}: {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  const bases = typeof chainId !== 'undefined' ? COMMON_BASES[chainId] ?? [] : []

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-row items-center text-base">
        Common bases
        <QuestionHelper text="These tokens are commonly paired with other tokens." />
      </div>
      <div className="flex flex-wrap">
        {bases.map((currency: Currency) => {
          const isSelected = selectedCurrency?.equals(currency)
          return (
            <Button
              variant="empty"
              type="button"
              onClick={() => !isSelected && onSelect(currency)}
              disabled={isSelected}
              key={currencyId(currency)}
              className="flex items-center px-3 py-2 m-1 space-x-2 transition-all rounded-2xl bg-gray-100/90 hover:bg-gray-100/40 disabled:bg-gray-100 dark:bg-gray-800/90 dark:hover:bg-gray-800/40 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
              <CurrencyLogo currency={currency} />
              <Typography variant="sm" className="font-semibold">
                {currency.symbol}
              </Typography>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
