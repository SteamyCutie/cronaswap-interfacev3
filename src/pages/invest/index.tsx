import React, { useState, useRef } from 'react'
import Container from '../../components/Container'
import Dots from '../../components/Dots'
import Head from 'next/head'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useCronaVaultContract } from 'hooks/useContract'
import { ArrowRightIcon } from '@heroicons/react/outline'
import { useTransactionAdder } from '../../states/transactions/hooks'
import { formatNumber, getBalanceAmount } from 'functions/formatBalance'
import { getCronaPrice } from 'features/staking/useStaking'
// import AutoPoolCard from 'app/features/staking/AutoPoolCard/AutoPoolCard'
// import ManualPoolCard from 'app/features/staking/ManualPoolCard/ManualPoolCard'
import Typography from 'app/components/Typography'
import { classNames, formatNumberScale } from 'app/functions'
import Button from 'app/components/Button'
import IncentivePool from 'app/features/staking/IncentivePool'
import QuestionHelper from 'app/components/QuestionHelper'
import SparkleIcon from 'app/components/SparkleIcon'
import { CurrencyLogoArray } from 'app/components/CurrencyLogo'
import { CRONA } from 'app/configs/tokens'
import { useActiveWeb3React } from 'app/services/web3'

const buttonStyle =
  'flex justify-center items-center w-full h-14 rounded font-bold md:font-medium md:text-lg mt-5 text-sm focus:outline-none focus:ring'

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

  const cronaPrice = getCronaPrice()
  const [pendingBountyTx, setPendingBountyTx] = useState(false)
  const handleBountyClaim = async () => {
    setPendingBountyTx(true)
    try {
      const gasLimit = await cronavaultContract.estimateGas.harvest()
      const tx = await cronavaultContract.harvest({ gasLimit: gasLimit.mul(120).div(100) })
      addTransaction(tx, {
        summary: `${i18n._(t`Claim`)} CRONA`,
      })
      setPendingBountyTx(false)
    } catch (error) {
      console.error(error)
      setPendingBountyTx(false)
    }
  }

  const [poolGroup, setPoolGroup] = useState(0)

  const statusCardStyle = "grid bg-white dark:bg-gray-850 text-gray-800 dark:text-gray-50 px-6 py-4 md:px-8 md:py-4 gap-1 md:gap-1 lg:gap-2 rounded-2xl shadow border border-gray-100 dark:border-gray-800 transition-all"
  const statusCardHeading = "text-sm md:text-base font-semibold dark:font-normal opacity-80 dark:opacity-50"
  const statusCardAPY = "flex items-center text-base md:text-xl font-extrabold uppercase"
  const statusCardDaily = "flex items-center text-sm md:text-base uppercase font-semibold dark:font-normal opacity-80 dark:opacity-50"

  const poolGroupStyle = 'cursor-pointer text-center opacity-80 dark:opacity-50 hover:opacity-100 dark:hover:opacity-100 px-2 py-1 transition-all border-b-2 border-blue/0'
  const poolGroupActive = 'text-blue dark:font-semibold border-blue/100 opacity-100 dark:opacity-100'
  const poolGroupPassive = 'text-gray-800 dark:text-gray-50'

  return (
    <Container id="bar-page" className="px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 transition-all" maxWidth="9xl">
      <Head>
        <title key="title">Stake | CronaSwap</title>
        <meta key="description" name="description" content="Stake CronaSwap" />
      </Head>
      <div className="grid m-auto gap-3 md:gap-5 lg:gap-6 transition-all">
        {/* Hero */}
        {/* <div className="flex-row items-center justify-between w-full px-8 py-6 space-y-2 rounded md:flex bg-cyan-blue bg-opacity-20">
          <div className="w-8/12 mb-5 space-y-2 gap-y-10 md:mb-0">
            <Typography variant="h2" className="mb-2 text-high-emphesis" weight={700}>
              {i18n._(t`Crona Stake`)}
            </Typography>
            <Typography variant="sm" weight={400}>
              {i18n._(t`Looking for a less resource-intensive alternative to mining?`)}
            </Typography>
            <Typography variant="sm" weight={400}>
              {i18n._(t`Use your CRONA tokens to earn more tokens,for Free.`)}
            </Typography>
            <a href="https://forms.gle/4MTpS6NquqWUVSZw8" target="_blank" rel="noreferrer">
              <div className="flex items-center gap-2 mt-2 text-sm font-bold font-Poppins">
                <div className="text-light-blue">{i18n._(t`Apply to Launch`)}</div>
                <ArrowRightIcon height={14} className="" />
              </div>
            </a>
          </div>

          <div className="w-full px-4 py-4 m-auto rounded-lg md:w-4/12 md:px-6 bg-cyan-blue bg-opacity-30">
            <div className="flex flex-row items-center text-lg font-bold text-white">
              {i18n._(t`Auto Crona Bounty`)}
              <QuestionHelper text="This bounty is given as a reward for providing a service to other users. Whenever you successfully claim the bounty, you’re also helping out by activating the Auto CRONA Pool’s compounding function for everyone.Auto-Compound Bounty: 0.25% of all Auto CRONA pool users pending yield" />
            </div>
            <div className="flex items-center justify-between space-x-10">
              <div>
                <div className="text-xl font-bold text-white">{Number(autocronaBountyValue.current).toFixed(3)}</div>
                <div className="text-base text-light-blue">
                  {' '}
                  {Number(autocronaBountyValue.current * cronaPrice).toFixed(3)} USD
                </div>
              </div>
              <div>
                <Button
                  id="btn-create-new-pool"
                  color="gradient"
                  variant="outlined"
                  size="sm"
                  disabled={!autocronaBountyValue.current || pendingBountyTx}
                  onClick={handleBountyClaim}
                >
                  {pendingBountyTx ? <Dots>{i18n._(t`Claiming`)} </Dots> : i18n._(t`Claim`)}
                </Button>
              </div>
            </div>
          </div>
        </div> */}

        <div className="mt-4 text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-50 transition-all">Featured Pools</div>
        <div className="grid gap-2 md:gap-3 lg:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2 md:gap-3 lg:gap-4 grid-cols-2 md:grid-cols-2 col-span-1 md:col-span-2">
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
        {/* <div className="w-full mt-6 space-y-4">
          <AutoPoolCard />
          <ManualPoolCard />
        </div> */}

        <div>
          <div className="mt-4 text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-50 transition-all">Investment Pools</div>
          <div className="flex mt-2 md:mt-4 justify-between md:justify-start space-x-2 md:space-x-4 lg:space-x-8 items-center text-sm md:text-sm lg:text-lg font-semibold dark:font-normal">
            <div onClick={() => setPoolGroup(0)} className={classNames(poolGroupStyle, poolGroup === 0 ? poolGroupActive : poolGroupPassive)}>Incentivized Pools</div>
            <div onClick={() => setPoolGroup(1)} className={classNames(poolGroupStyle, poolGroup === 1 ? poolGroupActive : poolGroupPassive)}>Community Pools</div>
            <div onClick={() => setPoolGroup(2)} className={classNames(poolGroupStyle, poolGroup === 2 ? poolGroupActive : poolGroupPassive)}>My Investments</div>
          </div>
          <IncentivePool />
        </div>
      </div>
    </Container>
  )
}

export default Invest