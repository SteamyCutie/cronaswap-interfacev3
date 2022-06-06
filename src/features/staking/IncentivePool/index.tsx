import useFuse from '../../../hooks/useFuse'
import Container from '../../../components/Container'
import Head from 'next/head'
import { useRouter } from 'next/router'
import NavLink from '../../../components/NavLink'

import React, { useState } from 'react'
import Search from '../../../components/Search'
import { useLingui } from '@lingui/react'
import useSortableData from '../../../hooks/useSortableData'
import { ChevronDownIcon } from '@heroicons/react/outline'
import Dots from '../../../components/Dots'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useInfiniteScroll } from '../../farms/hooks'
import usePools from './usePools'
import IncentivePoolItem from './IncentivePoolItem'
import { classNames } from 'app/functions'

export default function IncentivePool(): JSX.Element {
  const { i18n } = useLingui()

  const router = useRouter()
  const type = router.query.filter == null ? 'all' : (router.query.filter as string)

  const query = usePools()

  const FILTER = {
    all: (pool) => !pool.isFinished,
    inactive: (pool) => pool.isFinished,
  }

  const datas = query?.pools.filter((pool) => {
    return type in FILTER ? FILTER[type](pool) : true
  })

  // Search Setup
  const options = { keys: ['symbol', 'name'], threshold: 0.4 }
  const { result, search, term } = useFuse({
    data: datas && datas.length > 0 ? datas : [],
    options,
  })

  const flattenSearchResults = result.map((a: { item: any }) => (a.item ? a.item : a))

  // Sorting Setup
  const { items, requestSort, sortConfig } = useSortableData(flattenSearchResults)
  const [numDisplayed, setNumDisplayed] = useInfiniteScroll(items)

  const tabStyle = 'flex justify-center items-center h-full w-full rounded-lg cursor-pointer text-sm md:text-base'
  const activeTabStyle = `${tabStyle} text-high-emphesis font-bold bg-dark-900`
  const inactiveTabStyle = `${tabStyle} text-secondary`

  const [activeTab, setActiveTab] = useState(0)
  const [activeFilter, setActiveFilter] = useState(0)
  const [sortOption, setSortOption] = useState('Hot')

  const filterStyle = 'flex items-center text-xs md:text-sm lg:text-base justify-center px-4 py-2 rounded border font-bold dark:font-normal border-gray-100 dark:border-gray-800 shadow-md opacity-80 hover:opacity-100 cursor-pointer transition-all'

  return (
    <div className="w-full mt-4 col-span-4 space-y-6 lg:col-span-3">
      {/* search bar */}
      <div className="grid lg:justify-between gap-2 lg:flex">
        <div className='grid grid-cols-2 md:grid-cols-4 items-center justify-between lg:justify-center gap-2'>
          <div onClick={() => setActiveFilter(0)} className={classNames(filterStyle, activeFilter === 0 ? 'bg-blue text-gray-50 dark:bg-blue dark:text-gray-50' : 'bg-gray-100 dark:bg-gray-850 text-gray-850 dark:text-gray-50')}>Index Fund Pools</div>
          <div onClick={() => setActiveFilter(1)} className={classNames(filterStyle, activeFilter === 1 ? 'bg-blue text-gray-50 dark:bg-blue dark:text-gray-50' : 'bg-gray-100 dark:bg-gray-850 text-gray-850 dark:text-gray-50')}>Stablecoin Pools</div>
          <div onClick={() => setActiveFilter(2)} className={classNames(filterStyle, activeFilter === 2 ? 'bg-blue text-gray-50 dark:bg-blue dark:text-gray-50' : 'bg-gray-100 dark:bg-gray-850 text-gray-850 dark:text-gray-50')}>CRONA Pools</div>
          <div onClick={() => setActiveFilter(3)} className={classNames(filterStyle, activeFilter === 3 ? 'bg-blue text-gray-50 dark:bg-blue dark:text-gray-50' : 'bg-gray-100 dark:bg-gray-850 text-gray-850 dark:text-gray-50')}>Boosted Pools</div>
        </div>

        {/* select tab */}
        {/* <div className="flex m-auto mb-2 rounded md:m-0 md:w-3/12 h-14 bg-dark-800">
          <div className="w-6/12 h-full p-1" onClick={() => setActiveTab(0)}>
            <NavLink href="/stake?filter=all">
              <div className={activeTab === 0 ? activeTabStyle : inactiveTabStyle}>
                <p>All Pools</p>
              </div>
            </NavLink>
          </div>
          <div className="w-6/12 h-full p-1" onClick={() => setActiveTab(1)}>
            <NavLink href="/stake?filter=inactive">
              <div className={activeTab === 1 ? activeTabStyle : inactiveTabStyle}>
                <p>Inactive Pools</p>
              </div>
            </NavLink>
          </div>
          {/* <div className="w-6/12 h-full p-1">
              <div className={2 != 2 ? activeTabStyle : inactiveTabStyle}>
                <p>My Farms</p>
              </div>
            </div> */}

        <div className="flex gap-2 lg:w-3/12">
          {/* sort select menu*/}
          {/* <div className="w-1/3 h-14">
            <div className="relative inline-block w-full h-full group">
              <button className="inline-flex items-center justify-between w-full h-full px-4 py-2 font-semibold rounded bg-dark-800">
                <span className="mr-1">{sortOption}</span>
                <ChevronDownIcon width={12} height={12} />
              </button>
              <ul className="hidden pt-1 group-hover:block">
                <li
                  className={sortOption === 'Hot' ? 'hidden' : 'w-full'}
                  onClick={() => {
                    requestSort('hot', 'desc')
                    setSortOption('Hot')
                  }}
                >
                  <a className="block px-4 py-2 whitespace-no-wrap bg-dark-800 hover:bg-gray-900" href="#">
                    Hot
                  </a>
                  {sortConfig && sortConfig.key === 'hot'}
                </li>
                <li
                  className={sortOption === 'APR' ? 'hidden' : 'w-full'}
                  onClick={() => {
                    requestSort('apr', 'desc')
                    setSortOption('APR')
                  }}
                >
                  <a className="block px-4 py-2 whitespace-no-wrap bg-dark-800 hover:bg-gray-900" href="#">
                    APR
                  </a>
                  {sortConfig && sortConfig.key === 'apr'}
                </li>
                <li
                  className={sortOption === 'Multiplier' ? 'hidden' : 'w-full'}
                  onClick={() => {
                    requestSort('multiplier', 'desc')
                    setSortOption('Multiplier')
                  }}
                >
                  <a className="block px-4 py-2 whitespace-no-wrap bg-dark-800 hover:bg-gray-900" href="#">
                    Multiplier
                  </a>
                  {sortConfig && sortConfig.key === 'multiplier'}
                </li>
                <li
                  className={sortOption === 'Liquidity' ? 'hidden' : 'w-full'}
                  onClick={() => {
                    requestSort('tvl', 'desc')
                    setSortOption('Liquidity')
                  }}
                >
                  <a className="block px-4 py-2 whitespace-no-wrap bg-dark-800 hover:bg-gray-900" href="#">
                    Liquidity
                  </a>
                  {sortConfig && sortConfig.key === 'liquidity'}
                </li>
              </ul>
            </div>
          </div> */}

          {/* filter menu */}
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
      {
        items && items.length > 0 ? (
          <InfiniteScroll
            dataLength={numDisplayed}
            next={() => setNumDisplayed(numDisplayed + 5)}
            hasMore={true}
            loader={null}
          >
            <div className="space-y-2">
              {items.slice(0, numDisplayed).map((pool, index) => (
                <IncentivePoolItem key={index} pool={pool} />
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <div className="w-full py-6 text-center">{term ? <span>No Results.</span> : <Dots>Loading</Dots>}</div>
        )
      }
    </div >
  )
}
