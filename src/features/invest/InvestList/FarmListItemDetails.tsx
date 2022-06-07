import { Disclosure, Transition } from '@headlessui/react'
import React, { useState } from 'react'

import Button from 'app/components/Button'
import { ExternalLink as LinkIcon } from 'react-feather'
import { useLingui } from '@lingui/react'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/states/transactions/hooks'
import { MASTERCHEF_ADDRESS, Token, ZERO } from '@cronaswap/core-sdk'
import { getAddress } from '@ethersproject/address'
import { useTokenBalance } from 'app/states/wallet/hooks'
import { usePendingCrona, useUserInfo } from '../hooks'
import { tryParseAmount } from 'app/functions/parse'
import { ApprovalState, useApproveCallback } from 'app/hooks/useApproveCallback'
import useMasterChef from '../useMasterChef'
import { formatNumber, formatNumberScale, getExplorerLink } from 'app/functions'
import { t } from '@lingui/macro'
import Dots from 'app/components/Dots'
import NumericalInput from 'app/components/NumericalInput'
import ExternalLink from 'app/components/ExternalLink'
import Typography from 'app/components/Typography'
import { MASTERCHEFV2_ADDRESS } from 'app/constants/addresses'
import { FireIcon } from '@heroicons/react/outline'
import NavLink from 'app/components/NavLink'

const FarmListItemDetails = ({ farm }) => {
  const { i18n } = useLingui()

  const { account, chainId } = useActiveWeb3React()
  const [pendingTx, setPendingTx] = useState(false)
  const [depositValue, setDepositValue] = useState('')
  const [withdrawValue, setWithdrawValue] = useState('')

  const addTransaction = useTransactionAdder()

  const liquidityToken = new Token(
    chainId,
    getAddress(farm.lpToken),
    farm.token1 ? 18 : farm.token0 ? farm.token0.decimals : 18,
    farm.token1 ? farm.symbol : farm.token0.symbol,
    farm.token1 ? farm.name : farm.token0.name
  )

  // User liquidity token balance
  const balance = useTokenBalance(account, liquidityToken)

  // TODO: Replace these
  const { amount } = useUserInfo(farm, liquidityToken)

  const pendingCrona = usePendingCrona(farm)

  const typedDepositValue = tryParseAmount(depositValue, liquidityToken)
  const typedWithdrawValue = tryParseAmount(withdrawValue, liquidityToken)

  const [approvalState, approve] = useApproveCallback(
    typedDepositValue,
    farm.chef === 0 ? MASTERCHEF_ADDRESS[chainId] : MASTERCHEFV2_ADDRESS[chainId]
  )

  const { deposit, withdraw, harvest } = useMasterChef(farm.chef)

  return (
    <Transition
      show={true}
      enter="transition-opacity duration-0"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Disclosure.Panel className="flex flex-col mx-px transition-all border-t-0 border-white dark:border-gray-800 bg-gray-50 dark:bg-gray-850" static>
        {/* <div className="grid grid-cols-2 gap-4 p-4"> */}
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div className="col-span-2 text-center md:col-span-1">
            {account && (
              <div className="pr-4 mb-2 text-sm font-bold text-left text-gray-800 transition-all cursor-pointer opacity-80 dark:text-gray-50 dark:font-normal">
                {i18n._(t`Wallet Balance`)}: {formatNumberScale(balance?.toSignificant(6, undefined, 4) ?? 0, false, 4)}
                {farm.lpPrice && balance
                  ? ` (` + formatNumberScale(farm.lpPrice * Number(balance?.toFixed(18) ?? 0), true) + `)`
                  : ``}
              </div>
            )}
            <div className="relative flex items-center w-full mb-4">
              <NumericalInput
                className="w-full px-4 py-4 pr-20 text-gray-800 transition-all bg-white rounded shadow dark:bg-gray-800 focus:ring focus:ring-dark-purple dark:text-gray-100"
                value={depositValue}
                onUserInput={setDepositValue}
              />
              {account && (
                <Button
                  variant="outlined"
                  color="blue"
                  size="xs"
                  onClick={() => {
                    if (!balance?.equalTo(ZERO)) {
                      setDepositValue(balance?.toFixed(liquidityToken?.decimals))
                    }
                  }}
                  className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
                >
                  {i18n._(t`MAX`)}
                </Button>
              )}
            </div>
            {approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING ? (
              <Button
                className="w-full"
                color="gradient"
                disabled={approvalState === ApprovalState.PENDING}
                onClick={approve}
              >
                {approvalState === ApprovalState.PENDING ? <Dots>{i18n._(t`Approving`)}</Dots> : i18n._(t`Approve`)}
              </Button>
            ) : (
              <Button
                className="w-full"
                color="blue"
                disabled={pendingTx || !typedDepositValue || balance?.lessThan(typedDepositValue)}
                onClick={async () => {
                  setPendingTx(true)
                  try {
                    // KMP decimals depend on asset, SLP is always 18
                    const tx = await deposit(farm?.pid, depositValue.toBigNumber(liquidityToken?.decimals))

                    addTransaction(tx, {
                      summary: `${i18n._(t`Deposit`)} ${farm.token1 ? `${farm.token0.symbol}/${farm.token1.symbol}` : farm.token0.symbol
                        }`,
                    })
                  } catch (error) {
                    console.error(error)
                  }
                  setPendingTx(false)
                }}
              >
                {i18n._(t`Stake`)}
              </Button>
            )}
          </div>
          <div className="col-span-2 text-center md:col-span-1">
            {account && (
              <div className="pr-4 mb-2 text-sm font-bold text-left text-gray-800 transition-all cursor-pointer opacity-80 dark:text-gray-50 dark:font-normal">
                {i18n._(t`Your Staked`)}: {formatNumberScale(amount?.toSignificant(6, undefined, 4) ?? 0, false, 4)}
                {farm.lpPrice && amount
                  ? ` (` + formatNumberScale(farm.lpPrice * Number(amount?.toSignificant(18) ?? 0), true) + `)`
                  : ``}
              </div>
            )}
            <div className="relative flex items-center w-full mb-4">
              <NumericalInput
                className="w-full px-4 py-4 pr-20 text-gray-800 transition-all bg-white rounded shadow dark:bg-gray-800 focus:ring focus:ring-dark-purple dark:text-gray-100"
                value={withdrawValue}
                onUserInput={setWithdrawValue}
              />
              {account && (
                <Button
                  variant="outlined"
                  color="blue"
                  size="xs"
                  onClick={() => {
                    if (!amount?.equalTo(ZERO)) {
                      setWithdrawValue(amount?.toFixed(liquidityToken?.decimals))
                    }
                  }}
                  className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
                >
                  {i18n._(t`MAX`)}
                </Button>
              )}
            </div>
            <Button
              className="w-full"
              color="blue"
              disabled={pendingTx || !typedWithdrawValue || amount?.lessThan(typedWithdrawValue)}
              onClick={async () => {
                setPendingTx(true)
                try {
                  const tx = await withdraw(farm?.pid, withdrawValue.toBigNumber(liquidityToken?.decimals))
                  addTransaction(tx, {
                    summary: `${i18n._(t`Withdraw`)} ${farm.token1 ? `${farm.token0.symbol}/${farm.token1.symbol}` : farm.token0.symbol
                      }`,
                  })
                } catch (error) {
                  console.error(error)
                }

                setPendingTx(false)
              }}
            >
              {i18n._(t`Unstake`)}
            </Button>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="flex justify-between">
              <div className="pr-4 mb-2 text-sm font-bold text-left text-gray-800 transition-all cursor-pointer opacity-80 dark:text-gray-50 dark:font-normal">CRONA Earned</div>
              {farm.chef == '1' ? (
                <NavLink key={`farm-${farm?.pid}`} href="/boost">
                  <a className="flex items-center mb-2 text-xs font-bold md:text-base text-red">
                    <FireIcon className="h-4" />
                    Boost Reward
                  </a>
                </NavLink>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-col justify-between gap-4 text-sm transition-all bg-white border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-850">
              <div className="flex mt-4">
                <div className="flex flex-col w-2/3 px-4 font-bold text-gray-800 align-middle transition-all dark:text-gray-50 dark:font-normal">
                  <div className="text-2xl font-bold"> {formatNumber(pendingCrona?.toFixed(18))}</div>
                  <div className="text-sm font-bold transition-all dark:font-normal">~ {Number(formatNumber(pendingCrona?.toFixed(18))) * farm.tokenPrice}</div>
                </div>
                <div className="flex flex-col w-1/2 px-4 align-middle lg:w-1/3 gap-y-1">
                  <Button
                    color={Number(formatNumber(pendingCrona?.toFixed(18))) <= 0 ? 'blue' : 'gradient'}
                    size="sm"
                    className="w-full"
                    variant={Number(formatNumber(pendingCrona?.toFixed(18))) <= 0 ? 'outlined' : 'filled'}
                    disabled={Number(formatNumber(pendingCrona?.toFixed(18))) <= 0}
                    onClick={async () => {
                      setPendingTx(true)
                      try {
                        const tx = await harvest(farm.pid)
                        addTransaction(tx, {
                          summary: `${i18n._(t`Harvest`)} ${farm.token1 ? `${farm.token0.symbol}/${farm.token1.symbol}` : farm.token0.symbol
                            }`,
                        })
                      } catch (error) {
                        console.error(error)
                      }
                      setPendingTx(false)
                    }}
                  >
                    {i18n._(t`Harvest`)}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col p-2 space-y-2">
                <div className="flex flex-row justify-between px-2 text-md">
                  <ExternalLink
                    startIcon={<LinkIcon size={16} />}
                    href={chainId && getExplorerLink(chainId, farm.lpToken, 'address')}
                  >
                    <Typography variant="sm">{i18n._(t`View Contract`)}</Typography>
                  </ExternalLink>
                  <ExternalLink
                    startIcon={<LinkIcon size={16} />}
                    href={`https://app.cronaswap.org/add/${farm?.token0?.symbol == 'CRO' ? 'CRO' : farm?.token0?.id}/${farm?.token1?.symbol == 'CRO' ? 'CRO' : farm?.token1?.id
                      }`}
                  >
                    <Typography variant="sm">
                      {/* {i18n._(t`Get ${farm?.token0?.symbol}-${farm?.token1?.symbol} LP`)} */}
                      Get {farm?.token0?.symbol}-{farm?.token1?.symbol} LP
                    </Typography>
                  </ExternalLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Disclosure.Panel>
    </Transition>
  )
}

export default FarmListItemDetails
