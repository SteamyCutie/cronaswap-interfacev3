import React, { useState, useRef } from 'react'
import Container from '../../components/Container'
import Head from 'next/head'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useCronaVaultContract } from 'hooks/useContract'
import { useTransactionAdder } from '../../states/transactions/hooks'
import { getBalanceAmount } from 'functions/formatBalance'
import { classNames } from 'app/functions'
import InvestList from 'app/features/invest/InvestList'
import SparkleIcon from 'app/components/SparkleIcon'
import { CurrencyLogoArray } from 'app/components/CurrencyLogo'
import { CRONA } from 'app/configs/tokens'
import { useActiveWeb3React } from 'app/services/web3'

const Invest = () => {
  const { i18n } = useLingui()

  const { account, chainId } = useActiveWeb3React()

  const addTransaction = useTransactionAdder()
  const cronavaultContract = useCronaVaultContract()
  const autocronaBountyValue = useRef(0)

  const getCronaVault = async () => {
    const autocronaBounty = await cronavaultContract.calculateHarvestCronaRewards()
    autocronaBountyValue.current = getBalanceAmount(autocronaBounty._hex, 18).toNumber()
  }
  getCronaVault()

  // const [pendingBountyTx, setPendingBountyTx] = useState(false)
  // const handleBountyClaim = async () => {
  //   setPendingBountyTx(true)
  //   try {
  //     const gasLimit = await cronavaultContract.estimateGas.harvest()
  //     const tx = await cronavaultContract.harvest({ gasLimit: gasLimit.mul(120).div(100) })
  //     addTransaction(tx, {
  //       summary: `${i18n._(t`Claim`)} CRONA`,
  //     })
  //     setPendingBountyTx(false)
  //   } catch (error) {
  //     console.error(error)
  //     setPendingBountyTx(false)
  //   }
  // }

  const [poolGroup, setPoolGroup] = useState(0)

  const statusCardStyle = "grid bg-white dark:bg-gray-850 text-gray-800 dark:text-gray-50 px-6 py-4 md:px-8 md:py-4 gap-1 md:gap-1 lg:gap-2 rounded-2xl shadow border border-gray-100 dark:border-gray-800 transition-all"
  const statusCardHeading = "text-sm md:text-base font-semibold dark:font-normal opacity-80 dark:opacity-50"
  const statusCardAPY = "flex items-center text-base md:text-xl font-extrabold uppercase"
  const statusCardDaily = "flex items-center text-sm md:text-base uppercase font-semibold dark:font-normal opacity-80 dark:opacity-50"

  const poolGroupStyle = 'cursor-pointer text-center opacity-80 dark:opacity-50 hover:opacity-100 dark:hover:opacity-100 px-2 py-1 transition-all border-b-2 border-blue/0'
  const poolGroupActive = 'text-blue dark:font-semibold border-blue/100 opacity-100 dark:opacity-100'
  const poolGroupPassive = 'text-gray-800 dark:text-gray-50'

  return (
    <Container id="bar-page" className="px-4 py-4 transition-all md:px-8 lg:px-12 md:py-8 lg:py-12" maxWidth="9xl">
      <Head>
        <title key="title">Invest | CronaSwap</title>
        <meta key="description" name="description" content="Invest CronaSwap" />
      </Head>
      <div className="grid gap-3 m-auto transition-all md:gap-5 lg:gap-6">
        <div className="mt-4 text-lg font-bold text-gray-800 transition-all md:text-xl lg:text-2xl dark:text-gray-50">Featured Pools</div>
        <div className="grid grid-cols-1 gap-2 md:gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="grid grid-cols-2 col-span-1 gap-2 md:gap-3 lg:gap-4 md:grid-cols-2 md:col-span-2">
            <div className={statusCardStyle}>
              <div className={statusCardHeading}>{`A Late Quartet`}</div>
              <CurrencyLogoArray currencies={[CRONA[chainId], CRONA[chainId]]} size={40} />
              <div className={statusCardAPY}>{`11.89`}% APR <SparkleIcon /> </div>
              <div className={statusCardDaily}>{`0.03`}% Daily</div>
            </div>
            <div className={statusCardStyle}>
              <div className={statusCardHeading}>{`CRE8R in F-Major`}</div>
              <CurrencyLogoArray currencies={[CRONA[chainId], CRONA[chainId]]} size={40} />
              <div className={statusCardAPY}>{`117.47`}% APR <SparkleIcon /> </div>
              <div className={statusCardDaily}>{`0.31`}% Daily</div>
            </div>
          </div>
          <div className={statusCardStyle}>
            <div className={statusCardHeading}>{`Mor Steady Beets, Yearn Boosted`}</div>
            <CurrencyLogoArray currencies={[CRONA[chainId], CRONA[chainId]]} size={40} />
            <div className={statusCardAPY}>{`10.76`}% APR <SparkleIcon /> </div>
            <div className={statusCardDaily}>{`0.03`}% Daily</div>
          </div>
          <div className={statusCardStyle}>
            <div className={statusCardHeading}>{`The Stader Stacked Symphony`}</div>
            <CurrencyLogoArray currencies={[CRONA[chainId], CRONA[chainId]]} size={40} />
            <div className={statusCardAPY}>{`37.12`}% APR <SparkleIcon /> </div>
            <div className={statusCardDaily}>{`0.10`}% Daily</div>
          </div>
        </div>
        <div>
          <div className="mt-4 text-lg font-bold text-gray-800 transition-all md:text-xl lg:text-2xl dark:text-gray-50">Investment Pools</div>
          <div className="flex items-center justify-between mt-2 space-x-2 text-sm font-semibold md:mt-4 md:justify-start md:space-x-4 lg:space-x-8 md:text-sm lg:text-lg dark:font-normal">
            <div onClick={() => setPoolGroup(0)} className={classNames(poolGroupStyle, poolGroup === 0 ? poolGroupActive : poolGroupPassive)}>Incentivized Pools</div>
            <div onClick={() => setPoolGroup(1)} className={classNames(poolGroupStyle, poolGroup === 1 ? poolGroupActive : poolGroupPassive)}>Community Pools</div>
            <div onClick={() => setPoolGroup(2)} className={classNames(poolGroupStyle, poolGroup === 2 ? poolGroupActive : poolGroupPassive)}>My Investments</div>
          </div>
          <InvestList filter={true} />
        </div>
      </div>
    </Container>
  )
}

export default Invest