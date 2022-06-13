import { i18n } from "@lingui/core"
import { t } from "@lingui/macro"
import Container from "app/components/Container"
import SparkleIcon from "app/components/SparkleIcon"
import InvestList from "app/features/invest/InvestList"
import Head from "next/head"

const veCRONA = () => {

  const statusCardStyle = "grid bg-white dark:bg-gray-850 text-gray-800 dark:text-gray-50 px-6 py-4 md:px-8 md:py-4 gap-1 md:gap-1 lg:gap-2 rounded-2xl shadow border border-gray-100 dark:border-gray-800 transition-all"
  const statusCardHeading = "text-sm md:text-base font-semibold dark:font-normal opacity-80 dark:opacity-50"
  const statusCardAPY = "flex items-center text-base md:text-xl font-extrabold uppercase"
  const statusCardDaily = "flex items-center text-sm md:text-base uppercase font-semibold dark:font-normal opacity-80 dark:opacity-50"

  return (
    <Container id="veCRONA-page" className="px-4 py-4 transition-all md:px-8 lg:px-12 md:py-8 lg:py-12" maxWidth="9xl">
      <Head>
        <title>{i18n._(t`veCRONA`)} | Cronaswap</title>
        <meta
          key="description"
          name="description"
          content="Cronaswap allows for swapping of ERC20 compatible tokens across multiple networks"
        />
      </Head>
      <div className="grid gap-3 m-auto transition-all md:gap-5 lg:gap-6">
        <div className="mt-4 text-lg font-bold text-gray-800 transition-all md:text-xl lg:text-2xl dark:text-gray-50">My veCRONA</div>
        <div className="grid grid-cols-1 gap-2 md:gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="grid grid-cols-2 col-span-1 gap-2 md:gap-3 lg:gap-4 md:grid-cols-2 md:col-span-2">
            <div className={statusCardStyle}>
              <div className={statusCardHeading}>{`My CRONA-CRO`}</div>
              <div className={statusCardAPY}>{`-`} <SparkleIcon /> </div>
              <div className={statusCardDaily}>{`-`}</div>
            </div>
            <div className={statusCardStyle}>
              <div className={statusCardHeading}>{`My Locked CRONA-CRO`}</div>
              <div className={statusCardAPY}>{`-`} <SparkleIcon /> </div>
              <div className={statusCardDaily}>{`-`}</div>
            </div>
          </div>
          <div className={statusCardStyle}>
            <div className={statusCardHeading}>{`Locked until`}</div>
            <div className={statusCardAPY}>{`-`} <SparkleIcon /> </div>
            <div className={statusCardDaily}>{`-`}</div>
          </div>
          <div className={statusCardStyle}>
            <div className={statusCardHeading}>{`My veCRONA`}</div>
            <div className={statusCardAPY}>{`-`} <SparkleIcon /> </div>
            <div className={statusCardDaily}>{`-`}</div>
          </div>
        </div>
        <div>
          <div className="mt-4 text-lg font-bold text-gray-800 transition-all md:text-xl lg:text-2xl dark:text-gray-50">Investment Pools</div>
          <InvestList filter={false} />
        </div>
      </div>
    </Container >
  )
}

export default veCRONA