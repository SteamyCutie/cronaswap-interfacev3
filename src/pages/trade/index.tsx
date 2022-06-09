import { ChainId, Currency, CurrencyAmount, NATIVE, JSBI, Token, TradeType, Trade as V2Trade } from '@cronaswap/core-sdk'
import { ApprovalState, useApproveCallbackFromTrade } from 'app/hooks/useApproveCallback'
import { BottomGrouping, SwapCallbackError } from 'app/features/trade/styleds'
import { ButtonConfirmed, ButtonError } from 'app/components/Button'
import Column, { AutoColumn } from 'app/components/Column'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { UseERC20PermitState, useERC20PermitFromTrade } from 'app/hooks/useERC20Permit'
import { useAllTokens, useCurrency } from 'app/hooks/Tokens'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from 'app/states/trade/hooks'
import {
  useExpertModeManager,
  useUserGasPriceManager,
  useUserSingleHopOnly,
  useUserSlippageTolerance,
  useUserTransactionTTL,
} from 'app/states/user/hooks'
import { useNetworkModalToggle, useToggleSettingsMenu, useWalletModalToggle } from 'app/states/application/hooks'
import useWrapCallback, { WrapType } from 'app/hooks/useWrapCallback'

import AddressInputPanel from 'app/components/AddressInputPanel'
import Alert from 'app/components/Alert'
import Button from 'app/components/Button'
import ConfirmSwapModal from 'app/features/trade/ConfirmSwapModal'
import Container from 'app/components/Container'
import CurrencyInputPanel from 'app/components/CurrencyInputPanel'
import DoubleGlowShadow from 'app/components/DoubleGlowShadow'
import { Field } from 'app/states/trade/actions'
import Head from 'next/head'
import Loader from 'app/components/Loader'
import Lottie from 'lottie-react'
import ProgressSteps from 'app/components/ProgressSteps'
import ReactGA from 'react-ga'
import SwapHeader from 'app/features/trade/Header'
import TokenWarningModal from 'app/modals/TokenWarningModal'
import TradePrice from 'app/features/trade/TradePrice'
import Typography from 'app/components/Typography'
import UnsupportedCurrencyFooter from 'app/features/trade/UnsupportedCurrencyFooter'
import Web3Connect from 'app/components/Web3Connect'
import { classNames } from 'app/functions'
import { computeFiatValuePriceImpact } from 'app/functions/trade'
import confirmPriceImpactWithoutFee from 'app/features/trade/confirmPriceImpactWithoutFee'
import { maxAmountSpend } from 'app/functions/currency'
import swapArrowsAnimationData from 'app/animations/swap-arrows.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from 'app/services/web3'
import useENSAddress from 'app/hooks/useENSAddress'
import useIsArgentWallet from 'app/hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from 'app/hooks/useIsSwapUnsupported'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useSwapCallback } from 'app/hooks/useSwapCallback'
import { useUSDCValue } from 'app/hooks/useUSDCPrice'
import { warningSeverity } from 'app/functions/prices'
import { useETHBalances } from 'app/states/wallet/hooks'

import Image from 'next/image'
import Banner from 'app/components/Banner'
import { SwitchVerticalIcon } from '@heroicons/react/solid'
import TradeChart from 'app/components/TradeChart'


const Trade = () => {
  const { i18n } = useLingui()

  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])


  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const { account, chainId } = useActiveWeb3React()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  const toggleNetworkModal = useNetworkModalToggle()

  const router = useRouter()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()
  const toggleSettings = useToggleSettingsMenu()

  // get custom setting values for user
  const [ttl] = useUserTransactionTTL()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    allowedSlippage,
  } = useDerivedSwapInfo()

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
          [Field.INPUT]: parsedAmount,
          [Field.OUTPUT]: parsedAmount,
        }
        : {
          [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
          [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
        },
    [independentField, parsedAmount, showWrap, trade]
  )

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT])
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const isValid = !swapInputError

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    router.push('/swap/')
  }, [router])

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: V2Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const routeNotFound = !trade?.route

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  const signatureData = undefined

  // const {
  //   state: signatureState,
  //   signatureData,
  //   gatherPermitSignature,
  // } = useERC20PermitFromTrade(trade, allowedSlippage)

  const handleApprove = useCallback(async () => {
    await approveCallback()
    // if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
    //   try {
    //     await gatherPermitSignature()
    //   } catch (error) {
    //     // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
    //     if (error?.code !== 4001) {
    //       await approveCallback()
    //     }
    //   }
    // } else {
    //   await approveCallback()
    // }
  }, [approveCallback])
  // }, [approveCallback, gatherPermitSignature, signatureState])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  const [gasPrice] = useUserGasPriceManager()
  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
    signatureData,
    gasPrice
  )

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return
    }
    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    })
    swapCallback()
      .then((hash) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
        })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
                ? 'Swap w/o Send + recipient'
                : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            singleHopOnly ? 'SH' : 'MH',
          ].join('/'),
        })

        ReactGA.event({
          category: 'Routing',
          action: singleHopOnly ? 'Swap with multihop disabled' : 'Swap with multihop enabled',
        })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [
    swapCallback,
    priceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade?.inputAmount?.currency?.symbol,
    trade?.outputAmount?.currency?.symbol,
    singleHopOnly,
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact
    return warningSeverity(
      executionPriceImpact && priceImpact
        ? executionPriceImpact.greaterThan(priceImpact)
          ? executionPriceImpact
          : priceImpact
        : executionPriceImpact ?? priceImpact
    )
  }, [priceImpact, trade])

  const isArgentWallet = useIsArgentWallet()

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !isArgentWallet &&
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const swapIsUnsupported = useIsSwapUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode

  const [animateSwapArrows, setAnimateSwapArrows] = useState<boolean>(false)

  return (
    <Container id="swap-page" className="p-4 md:py-8 lg:py-24" maxWidth="8xl">
      <Head>
        <title>{i18n._(t`Trade`)} | Cronaswap</title>
        <meta
          key="description"
          name="description"
          content="Cronaswap allows for swapping of ERC20 compatible tokens across multiple networks"
        />
      </Head>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />
      <div className="flex gap-4">
        <div className="gap-4">
          <div className='grid p-4 font-bold transition-all bg-gray-100 border w-96 rounded-2xl text-gray-850 dark:text-gray-50 dark:font-normal border-gray-50/50 dark:border-gray-800 dark:bg-gray-850'>
            <div className="flex items-center justify-between py-4 px-4">
              <div className='flex items-center'>
                My wallet
              </div>
              <div className='flex items-center text-lg gap-1.5'>
                <div className="flex font-extrabold">
                  {account && chainId && userEthBalance ? userEthBalance?.toSignificant(4) : '-'}
                </div>
                <div className="flex font-normal">
                  {NATIVE[chainId].symbol}
                </div>
              </div>
            </div>
            {!account && (
              <div className='pt-4 border-t border-gray-850/50 dark:border-gray-100/30 transition-all'>
                <Web3Connect size='lg' />
              </div>
            )}
          </div>
          <div className="flex mt-4 items-center p-4 font-bold transition-all bg-gray-100 border w-96 rounded-2xl text-gray-850 dark:text-gray-50 dark:font-normal border-gray-50/50 dark:border-gray-800 dark:bg-gray-850">
            <div className='grid'>
              <div className="flex items-center justify-between py-4 px-4">
                Trending Pairs
              </div>
              <div className='flex flex-wrap pt-4 border-t border-gray-850/50 dark:border-gray-100/30 transition-all gap-2'>
                <Button className='bg-gray-850/20 dark:bg-gray-100/10 shadow text-xs' size='sm'>USDC / CRONA</Button>
                <Button className='bg-gray-850/20 dark:bg-gray-100/10 shadow text-xs' size='sm'>USDT / CRONA</Button>
                <Button className='bg-gray-850/20 dark:bg-gray-100/10 shadow text-xs' size='sm'>USDC / USDT</Button>
              </div>
            </div>
          </div>
        </div>
        <DoubleGlowShadow>
          <div className="z-0 gap-4 p-3 transition-all md:p-4 lg:p-6 rounded-3xl">
            <SwapHeader
              input={currencies[Field.INPUT]}
              output={currencies[Field.OUTPUT]}
              allowedSlippage={allowedSlippage}
            />

            <ConfirmSwapModal
              isOpen={showConfirm}
              trade={trade}
              originalTrade={tradeToConfirm}
              onAcceptChanges={handleAcceptChanges}
              attemptingTxn={attemptingTxn}
              txHash={txHash}
              recipient={recipient}
              allowedSlippage={allowedSlippage}
              onConfirm={handleSwap}
              swapErrorMessage={swapErrorMessage}
              onDismiss={handleConfirmDismiss}
            />
            <div>
              <CurrencyInputPanel
                // priceImpact={priceImpact}
                label={
                  independentField === Field.OUTPUT && !showWrap ? i18n._(t`Swap From (est.):`) : i18n._(t`Swap From:`)
                }
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={showMaxButton}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                showCommonBases={true}
                id="swap-currency-input"
              />
              <AutoColumn
                justify="space-between"
                className={classNames(isExpertMode ? '-mt-3 -mb-3' : '-mt-4 -mb-7', 'transition-all pl-2')}
              >
                <div
                  className={classNames(
                    isExpertMode ? 'justify-between' : 'justify-center',
                    'px-4 flex-wrap w-full flex'
                  )}
                >
                  <button
                    className="z-0 rounded-3xl"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                  >
                    <div className="p-1.5 rounded-[18px] bg-gray-100 dark:bg-gray-850 transition-all">
                      <div
                        className="p-3 transition-all bg-white rounded-1.5xl hover:bg-white/80 dark:bg-gray-800 dark:hover:bg-gray-800/80 text-gray-850 dark:text-gray-100"
                      // onMouseEnter={() => setAnimateSwapArrows(true)}
                      // onMouseLeave={() => setAnimateSwapArrows(false)}
                      >
                        <SwitchVerticalIcon width={18} height={18} />
                        {/* <Lottie
                        animationData={swapArrowsAnimationData}
                        autoplay={animateSwapArrows}
                        loop={false}
                        style={{ width: 32, height: 32 }}
                      /> */}
                      </div>
                    </div>
                  </button>
                  {isExpertMode ? (
                    <div className="flex items-center transition-all text-gray-850 dark:text-gray-100 hover:text-gray-850/80 dark:hover:text-gray-100/80">
                      {recipient === null && !showWrap ? (
                        <Button size="xs" id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                          + Add recipient (optional)
                        </Button>
                      ) : (
                        <Button size="xs" id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                          - {i18n._(t`Remove recipient`)}
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              </AutoColumn>

              <div>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.OUTPUT]}
                  onUserInput={handleTypeOutput}
                  label={independentField === Field.INPUT && !showWrap ? i18n._(t`Swap To (est.):`) : i18n._(t`Swap To:`)}
                  showMaxButton={false}
                  hideBalance={false}
                  fiatValue={fiatValueOutput ?? undefined}
                  priceImpact={priceImpact}
                  currency={currencies[Field.OUTPUT]}
                  onCurrencySelect={handleOutputSelect}
                  otherCurrency={currencies[Field.INPUT]}
                  showCommonBases={true}
                  id="swap-currency-output"
                />
                {/* {Boolean(trade) && (
                <div className="grid gap-2 p-5 mt-2 transition-all bg-white border cursor-pointer dark:bg-gray-800 border-light-stroke dark:border-dark-stroke rounded-xl">
                  <TradePrice
                    price={trade?.executionPrice}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                    className=""
                  />
                  <TradingMode mode={tradingMode} />
                </div>
              )} */}
              </div>
            </div>

            {recipient !== null && !showWrap && (
              <>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                {recipient !== account && (
                  <Alert
                    type="warning"
                    dismissable={false}
                    showIcon
                    className="p-4 md:p-4 md:pl-4 md:pr-6"
                    message={i18n._(
                      t`Please note that the recipient address is different from the connected wallet address.`
                    )}
                  />
                )}
              </>
            )}

            {/* {showWrap ? null : (
            <div
              style={{
                padding: showWrap ? '.25rem 1rem 0 1rem' : '0px',
              }}
            >
              <div className="px-5 mt-1">{doArcher && userHasSpecifiedInputOutput && <MinerTip />}</div>
            </div>
          )} */}
            {/*
          {trade && (
            <div className="p-5 rounded bg-dark-800">
              <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
            </div>
          )} */}

            <BottomGrouping>
              {swapIsUnsupported ? (
                <Button color="red" size="lg" disabled>
                  {i18n._(t`Unsupported Asset`)}
                </Button>
              ) : !account ? (
                <Web3Connect size="lg" className="w-full" />
              ) : showWrap ? (
                <Button color="gradient" size="lg" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP
                      ? i18n._(t`Wrap`)
                      : wrapType === WrapType.UNWRAP
                        ? i18n._(t`Unwrap`)
                        : null)}
                </Button>
              ) : routeNotFound && userHasSpecifiedInputOutput ? (
                <div className="grid justify-center text-sm text-center text-gray-800 transition-all dark:text-white">
                  <div className="mb-1">{i18n._(t`Insufficient liquidity for this trade`)}</div>
                  {singleHopOnly && <div className="mb-1">{i18n._(t`Try enabling multi-hop trades`)}</div>}
                </div>
              ) : showApproveFlow ? (
                <div>
                  {approvalState !== ApprovalState.APPROVED && (
                    <ButtonConfirmed
                      onClick={handleApprove}
                      disabled={approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                      size="lg"
                      color="gradient"
                      className="text-base font-extrabold"
                    >
                      {approvalState === ApprovalState.PENDING ? (
                        <div className="flex items-center justify-center h-full space-x-2">
                          <div>Approving</div>
                          <Loader stroke="white" />
                        </div>
                      ) : (
                        i18n._(t`Approve ${currencies[Field.INPUT]?.symbol}`)
                      )}
                    </ButtonConfirmed>
                  )}
                  {approvalState === ApprovalState.APPROVED && (
                    <ButtonError
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap()
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            showConfirm: true,
                            txHash: undefined,
                          })
                        }
                      }}
                      style={{
                        width: '100%',
                      }}
                      id="swap-button"
                      disabled={
                        !isValid || approvalState !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                      }
                      error={isValid && priceImpactSeverity > 2}
                      className="text-sm font-extrabold transition-all"
                    >
                      {priceImpactSeverity > 3 && !isExpertMode
                        ? i18n._(t`Price Impact High`)
                        : priceImpactSeverity > 2
                          ? i18n._(t`Swap Anyway`)
                          : i18n._(t`Swap`)}
                    </ButtonError>
                  )}
                </div>
              ) : (
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined,
                      })
                    }
                  }}
                  id="swap-button"
                  disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                  error={isValid && priceImpactSeverity > 2 && !swapCallbackError || !!swapInputError}
                  className="text-sm font-extrabold transition-all"
                >
                  {swapInputError
                    ? swapInputError
                    : priceImpactSeverity > 3 && !isExpertMode
                      ? i18n._(t`Price Impact Too High`)
                      : priceImpactSeverity > 2
                        ? i18n._(t`Swap Anyway`)
                        : i18n._(t`Swap`)}
                </ButtonError>
              )}
              {showApproveFlow && (
                <Column style={{ marginTop: '1rem' }}>
                  <ProgressSteps steps={[approvalState === ApprovalState.APPROVED]} />
                </Column>
              )}
              {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </BottomGrouping>
            {/* {!swapIsUnsupported ? (
        <AdvancedSwapDetailsDropdown trade={trade} />
      ) : (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies.INPUT, currencies.OUTPUT]}
        />
      )} */}

            {!swapIsUnsupported ? null : (
              <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
            )}
          </div>
          <Banner />
        </DoubleGlowShadow>
        <div className="grid gap-4">
          <div className="flex p-4 font-bold transition-all bg-gray-100 border w-96 h-96 rounded-2xl text-gray-850 dark:text-gray-50 dark:font-normal border-gray-50/50 dark:border-gray-800 dark:bg-gray-850">
            <TradeChart />
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Trade
