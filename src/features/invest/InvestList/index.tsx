import { useState } from "react"
import { useLingui } from "@lingui/react"
import Search from "app/components/Search"
import Dots from 'app/components/Dots'
import { classNames } from "app/functions"
import { useFuse } from "app/hooks"
import useSortableData from 'app/hooks/useSortableData'
import { useRouter } from "next/router"
import useFarmsV2 from 'app/features/invest/useFarmsV2'
import { useInfiniteScroll, usePositions } from 'app/features/invest/hooks'
import InfiniteScroll from 'react-infinite-scroll-component'
import FarmListItem from "./FarmListItem"


const InvestList = () => {
  const { i18n } = useLingui()

  const router = useRouter()
  const type = router.query.filter == null ? 'all' : (router.query.filter as string)

  const query = useFarmsV2()

  let tokenPrice = 0
  let totalTvlInUSD = 0

  query?.farms.map((farm: any) => {
    tokenPrice = farm.tokenPrice
    totalTvlInUSD = farm.totalTvlInUSD
  })

  const FILTER = {
    all: (farm: any) => farm.multiplier !== 0,
    inactive: (farm: any) => farm.multiplier == 0,
  }

  const datas = query?.farms.filter((farm: any) => {
    return type in FILTER ? FILTER[type](farm) : true
  })

  const options = { keys: ['symbol', 'name'], threshold: 0.4 }
  const { result, search, term } = useFuse({
    data: datas && datas.length > 0 ? datas : [],
    options,
  })

  const flattenSearchResults = result.map((a: { item: any }) => (a.item ? a.item : a))
  const { items, requestSort, sortConfig } = useSortableData(flattenSearchResults)
  const [numDisplayed, setNumDisplayed] = useInfiniteScroll(items)


  const [activeFilter, setActiveFilter] = useState(0)

  const filterStyle = 'flex items-center text-xs md:text-sm lg:text-base justify-center px-4 py-2 rounded border font-bold dark:font-normal border-gray-100 dark:border-gray-800 shadow-md opacity-80 hover:opacity-100 cursor-pointer transition-all'

  return (
    <div className="w-full col-span-4 mt-4 space-y-3 lg:col-span-3">
      {/* search bar */}
      <div className="grid gap-2 lg:justify-between lg:flex">
        <div className='grid items-center justify-between grid-cols-2 gap-2 md:grid-cols-4 lg:justify-center'>
          <div onClick={() => setActiveFilter(0)} className={classNames(filterStyle, activeFilter === 0 ? 'bg-blue text-gray-50 dark:bg-blue dark:text-gray-50' : 'bg-gray-100 dark:bg-gray-850 text-gray-850 dark:text-gray-50')}>Index Fund Pools</div>
          <div onClick={() => setActiveFilter(1)} className={classNames(filterStyle, activeFilter === 1 ? 'bg-blue text-gray-50 dark:bg-blue dark:text-gray-50' : 'bg-gray-100 dark:bg-gray-850 text-gray-850 dark:text-gray-50')}>Stablecoin Pools</div>
          <div onClick={() => setActiveFilter(2)} className={classNames(filterStyle, activeFilter === 2 ? 'bg-blue text-gray-50 dark:bg-blue dark:text-gray-50' : 'bg-gray-100 dark:bg-gray-850 text-gray-850 dark:text-gray-50')}>CRONA Pools</div>
          <div onClick={() => setActiveFilter(3)} className={classNames(filterStyle, activeFilter === 3 ? 'bg-blue text-gray-50 dark:bg-blue dark:text-gray-50' : 'bg-gray-100 dark:bg-gray-850 text-gray-850 dark:text-gray-50')}>Boosted Pools</div>
        </div>

        <div className="flex gap-2 lg:w-3/12">
          <Search
            search={search}
            term={term}
            inputProps={{
              className:
                'relative w-full bg-transparent border border-transparent dark:border-transparent focus:border-gradient-r-blue-red-white dark:focus:border-gradient-r-blue-red-gray-850 rounded placeholder-secondary focus:placeholder-primary font-bold dark:font-normal text-base text-gray-800 dark:text-gray-100 px-4 py-2.5 transition-all',
            }}
          />
        </div>
      </div>
      <div className="flex-row transition-all rounded shadow-md">
        {items && items.length > 0 ? (
          <InfiniteScroll
            dataLength={numDisplayed}
            next={() => setNumDisplayed(numDisplayed + 5)}
            hasMore={true}
            loader={null}
          >
            <div className='w-full px-4 py-6 text-sm text-left text-gray-800 transition-all bg-white border border-gray-100 rounded rounded-b-none cursor-pointer select-none dark:border-gray-800 dark:bg-gray-850 dark:text-primary md:text-lg'>
            </div>
            {items.slice(0, numDisplayed).map((farm, index) => (
              <FarmListItem key={index} farm={farm} index={index === numDisplayed - 1 || index === items.length - 1} />
            ))}
          </InfiniteScroll>
        ) : (
          <div className="w-full py-6 text-center text-gray-800 transition-all dark:text-gray-50">{term ? <span>No Results.</span> : <Dots>Loading</Dots>}</div>
        )}
      </div>
    </div>
  )
}

export default InvestList