import { NETWORK_ICON, NETWORK_LABEL } from '../../configs/networks'

import Image from 'next/image'
import NetworkModel from '../../modals/NetworkModal'
import React from 'react'
import { useActiveWeb3React } from '../../services/web3'
import { useNetworkModalToggle } from '../../states/application/hooks'
import { ChainId } from '@cronaswap/core-sdk'

function Web3Network(): JSX.Element | null {
  const { chainId } = useActiveWeb3React()

  const toggleNetworkModal = useNetworkModalToggle()

  if (!chainId) return null

  return (
    <div
      className="flex items-center rounded bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-50 shadow-md transition-all hover:opacity-80 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto"
      onClick={() => toggleNetworkModal()}
    >
      {ChainId.CRONOS === chainId ? (
        <div className="grid items-center grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max">
          <Image src={NETWORK_ICON[chainId]} alt="Switch Network" className="rounded-md" width="22px" height="22px" />
          <div>{NETWORK_LABEL[chainId]}</div>
        </div>
      ) : (
        <div className="grid items-center grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max bg-blue/50">
          <Image src={NETWORK_ICON[chainId]} alt="Switch Network" className="rounded-md" width="22px" height="22px" />
          <div>{NETWORK_LABEL[chainId]}</div>
        </div>
      )}

      <NetworkModel />
    </div>
  )
}

export default Web3Network
