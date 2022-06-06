import React from 'react'
import { Search as SearchIcon } from 'react-feather'
import { classNames } from '../../functions'

export default function Search({
  term,
  search,
  className = 'bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 shadow-sm transition-all',
  inputProps = {
    className:
      'text-baseline bg-transparent w-full py-2 pl-2 pr-14 rounded focus:outline-none focus:ring focus:ring-blue transition-all',
  },
  ...rest
}: {
  term: string
  search: (value: string) => void
  inputProps?: any
  className?: string
}) {
  return (
    <div className={classNames('relative w-full rounded transition-all', className)} {...rest}>
      <input
        className={classNames(inputProps.className)}
        onChange={(e) => search(e.target.value)}
        value={term}
        placeholder="Search by name, symbol, address"
        {...inputProps}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-850 dark:text-gray-50 opacity-80 pointer-events-none transition-all">
        <SearchIcon size={16} />
      </div>
    </div>
  )
}
