import { ChainId, Currency, NATIVE, CRONA_ADDRESS } from '@cronaswap/core-sdk'
import { Feature, featureEnabled } from '../../functions/feature'
import React from 'react'

import { ANALYTICS_URL } from '../../constants'
import ExternalLink from '../ExternalLink'
import Image from 'next/image'
import LanguageSwitch from '../LanguageSwitch'
import Link from 'next/link'
import More from './More'
import NavLink from '../NavLink'
import { Popover } from '@headlessui/react'
import QuestionHelper from '../QuestionHelper'
import Web3Network from '../Web3Network'
import Web3Status from '../Web3Status'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../services/web3'
import { useETHBalances } from '../../states/wallet/hooks'
import { useLingui } from '@lingui/react'
import TokenStats from '../TokenStats'
import { ExternalLink as LinkIcon } from 'react-feather'
import Typography from '../Typography'
import ColorSwith from '../ColorSwitch'
import { useRouter } from 'next/router'
import { classNames } from 'app/functions'

// import { ExternalLink, NavLink } from "./Link";
// import { ReactComponent as Burger } from "../assets/images/burger.svg";

const AppBar = (): JSX.Element => {
  const { i18n } = useLingui()
  const { account, chainId, library } = useActiveWeb3React()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  const routeTag: any = useRouter().asPath.split('/')[1].split('?')[0]
  const navLinkStyle = "flex justify-start lg:justify-center items-center p-2 md:p-5 text-base hover:opacity-100 md:pt-5 md:pb-6 whitespace-nowrap md:border-t-4 transition-all"
  const navDarkBorder = "opacity-100 text-blue dark:text-blue border-blue dark:border-blue"
  const navLightBorder = "opacity-80 border-blue/0 dark:border-blue/0"

  return (
    <header className="flex-shrink-0 w-full">
      <Popover as="nav" className="z-10 w-full py-6 px-4 md:p-0 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-50 transition-all font-extrabold">
        {({ open }) => (
          <>
            <div className="px-4 py-0 transition-color">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="fill-gray-800 dark:fill-white transition-color pr-4">
                    <svg width="180" height="34" viewBox="0 0 180 34" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M50.1494 28.5815C51.5818 28.5815 53.1392 28.1752 54.8216 27.3628V23.1311C53.5711 24.5755 52.0479 25.2977 50.2517 25.2977C48.3647 25.2977 46.7902 24.536 45.5284 23.0126C44.2666 21.4892 43.6357 19.7683 43.6357 17.85C43.6357 15.8639 44.2723 14.0979 45.5455 12.5519C46.8186 11.006 48.3988 10.233 50.2858 10.233C52.1047 10.233 53.6166 10.9552 54.8216 12.3996V8.13408C53.2756 7.34417 51.7409 6.94922 50.2176 6.94922C47.3075 6.94922 44.8747 8.02124 42.9195 10.1653C40.9642 12.3093 39.9866 14.8935 39.9866 17.9177C39.9866 20.8291 40.9642 23.3342 42.9195 25.4331C44.8747 27.532 47.2847 28.5815 50.1494 28.5815ZM60.9372 28.0398V22.014C60.9372 18.7189 62.0967 17.0714 64.4157 17.0714C65.0068 17.0714 65.5525 17.2294 66.0527 17.5453L66.4619 14.5662C65.9845 14.3405 65.4616 14.2277 64.8932 14.2277C63.097 14.2277 61.7784 14.837 60.9372 16.0558V14.6678H57.6291V28.0398H60.9372ZM79.2273 26.4826C77.9313 27.8142 76.2318 28.4799 74.1288 28.4799C72.0257 28.4799 70.3149 27.8142 68.9962 26.4826C67.6775 25.151 67.0182 23.4414 67.0182 21.3538C67.0182 19.2662 67.6662 17.5566 68.9621 16.225C70.258 14.8935 71.9632 14.2277 74.0776 14.2277C76.1921 14.2277 77.9029 14.8878 79.2102 16.2081C80.5175 17.5284 81.1712 19.238 81.1712 21.3369C81.1712 23.4358 80.5232 25.151 79.2273 26.4826ZM74.1457 25.6362C73.0317 25.6362 72.1223 25.2413 71.4175 24.4514C70.7127 23.6615 70.3603 22.6459 70.3603 21.4046C70.3603 20.1407 70.7127 19.1025 71.4175 18.2901C72.1223 17.4776 73.026 17.0713 74.1287 17.0713C75.2314 17.0713 76.1238 17.4945 76.8058 18.3408C77.4879 19.1872 77.8289 20.1915 77.8289 21.3538C77.8289 22.5161 77.4936 23.5204 76.8229 24.3667C76.1522 25.2131 75.2598 25.6362 74.1457 25.6362ZM86.5362 21.2692V28.0398H83.2282V14.6678H86.5362V15.8865C87.4684 14.7806 88.8439 14.2277 90.6628 14.2277C93.7548 14.2277 95.3009 16.1122 95.3009 19.8812V28.0398H92.0269V20.9645C92.0269 18.1434 91.1516 16.7328 89.4009 16.7328C87.4911 16.7328 86.5362 18.2449 86.5362 21.2692ZM103.565 28.4799C105.452 28.4799 106.873 27.927 107.828 26.8211V28.0398H111.067V14.6678H107.828V15.9204C106.85 14.7919 105.406 14.2277 103.496 14.2277C101.7 14.2277 100.228 14.9104 99.0801 16.2758C97.9319 17.6412 97.3579 19.2944 97.3579 21.2353C97.3579 23.1763 97.9206 24.8689 99.046 26.3133C100.171 27.7577 101.678 28.4799 103.565 28.4799ZM101.757 24.4514C102.462 25.2413 103.371 25.6362 104.485 25.6362C105.599 25.6362 106.498 25.2526 107.18 24.4852C107.862 23.7179 108.203 22.6684 108.203 21.3369C108.203 20.0956 107.85 19.0743 107.145 18.2731C106.441 17.4719 105.537 17.0713 104.434 17.0713C103.332 17.0713 102.434 17.4607 101.74 18.2393C101.047 19.0179 100.7 20.0504 100.7 21.3369C100.7 22.6233 101.052 23.6615 101.757 24.4514ZM119.707 28.5815C121.821 28.5815 123.486 27.9326 124.703 26.6349C125.919 25.3372 126.527 23.6389 126.527 21.54C126.527 20.0053 125.766 18.6738 124.242 17.5453C124.22 17.5453 123.134 16.9472 120.985 15.7511C118.837 14.5549 117.763 13.5224 117.763 12.6535C117.763 11.7846 118.058 11.0906 118.649 10.5715C119.241 10.0524 119.968 9.7929 120.832 9.7929C122.196 9.7929 123.322 10.4135 124.208 11.6548L125.845 9.25124C124.458 7.71656 122.571 6.94922 120.184 6.94922C118.456 6.94922 117.018 7.54165 115.87 8.72652C114.722 9.91138 114.148 11.3727 114.148 13.1105C114.148 15.1417 115.392 16.7046 117.882 17.7992C120.372 18.8938 121.832 19.7063 122.264 20.2366C122.696 20.767 122.912 21.382 122.912 22.0817C122.912 23.0521 122.622 23.8759 122.043 24.5529C121.463 25.23 120.673 25.5685 119.672 25.5685C118.831 25.5685 118.013 25.2413 117.217 24.5868C116.421 23.9323 115.876 23.2101 115.58 22.4202L113.363 24.5868C114.909 27.2499 117.024 28.5815 119.707 28.5815ZM138.338 19.7458L134.791 28.3107H133.086L126.913 14.6678H130.562L133.871 23.4019L137.451 14.2277H138.645L142.396 23.3681L145.739 14.6678H149.388L143.113 28.3107H141.442L138.338 19.7458ZM155.741 28.4799C157.628 28.4799 159.049 27.927 160.004 26.8211V28.0398H163.244V14.6678H160.004V15.9204C159.027 14.7919 157.583 14.2277 155.673 14.2277C153.877 14.2277 152.405 14.9104 151.257 16.2758C150.109 17.6412 149.534 19.2944 149.534 21.2353C149.534 23.1763 150.097 24.8689 151.223 26.3133C152.348 27.7577 153.854 28.4799 155.741 28.4799ZM153.934 24.4514C154.639 25.2413 155.548 25.6362 156.662 25.6362C157.776 25.6362 158.674 25.2526 159.356 24.4852C160.039 23.7179 160.38 22.6684 160.38 21.3369C160.38 20.0956 160.027 19.0743 159.322 18.2731C158.618 17.4719 157.714 17.0713 156.611 17.0713C155.508 17.0713 154.61 17.4607 153.917 18.2393C153.223 19.0179 152.877 20.0504 152.877 21.3369C152.877 22.6233 153.229 23.6615 153.934 24.4514ZM169.564 33.6933L169.633 26.7873C170.406 27.9157 171.781 28.4799 173.759 28.4799C175.601 28.4799 177.101 27.7916 178.261 26.4149C179.42 25.0382 180 23.3229 180 21.2692C180 19.3734 179.415 17.7259 178.244 16.3266C177.073 14.9273 175.601 14.2277 173.827 14.2277C171.94 14.2277 170.519 14.7806 169.564 15.8865V14.6678H166.256V33.6933H169.564ZM170.314 24.316C171.065 25.1961 171.929 25.6362 172.906 25.6362C174.066 25.6362 174.975 25.23 175.635 24.4175C176.294 23.605 176.624 22.5782 176.624 21.3369C176.624 20.1859 176.294 19.1872 175.635 18.3408C174.975 17.4945 174.066 17.0713 172.906 17.0713C171.838 17.0713 170.951 17.5002 170.246 18.3578C169.541 19.2154 169.189 20.2028 169.189 21.3199C169.189 22.4371 169.564 23.4358 170.314 24.316Z"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.5679 30.0416C14.0068 31.6751 12.1821 30.0416 12.1821 30.0416L0.471985 18.4449L0.450317 21.0094L11.1592 32.1344C13.7417 34.4907 16.6408 32.2083 16.6408 32.2083L25.7511 22.7127L22.6921 22.7548L15.5679 30.0416ZM21.5041 32.3262H18.9164L29.3272 21.8768H31.9136L21.5041 32.3262Z"
                        fill="url(#paint0_linear_101_3)"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M17.9977 3.15957C17.9977 3.15957 19.8224 1.52605 21.3835 3.15957L28.5078 10.4463L31.5667 10.4885L22.4565 0.992869C22.4565 0.992869 19.5574 -1.28954 16.9749 1.06673L6.26595 12.1918L6.28762 14.7563L17.9977 3.15957ZM3.14756 15.1346C3.14756 15.1346 1.52029 13.3028 3.14756 11.7357L14.6999 0.328484H11.5341L0.989137 10.6587C0.989137 10.6587 -1.28455 13.5689 1.06272 16.1613L12.1452 26.9113L14.6999 26.8895L3.14756 15.1346ZM25.7511 10.4702L20.851 5.85907H18.3324L23.2365 10.4702H25.7511Z"
                        fill="url(#paint1_linear_101_3)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_101_3"
                          x1="16.6193"
                          y1="15.7435"
                          x2="8.01356"
                          y2="32.1273"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#50D546" />
                          <stop offset="0.512485" stopColor="#FFEB17" />
                          <stop offset="1" stopColor="#FF8200" />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear_101_3"
                          x1="-2.52836"
                          y1="11.1695"
                          x2="21.2913"
                          y2="27.999"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#003DE9" />
                          <stop offset="0.380035" stopColor="#FF0058" />
                          <stop offset="1" stopColor="#81BB47" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="hidden sm:block sm:ml-4">
                    <div className="flex space-x-2">
                      {chainId && featureEnabled(Feature.INVEST, chainId) && (
                        <NavLink href={'/invest'}>
                          <a
                            id={`invest-nav-link`}
                            className={classNames(navLinkStyle, routeTag === "invest" ? navDarkBorder : navLightBorder)}
                          >
                            {i18n._(t`Invest`)}
                          </a>
                        </NavLink>
                      )}
                      {chainId && featureEnabled(Feature.TRADE, chainId) && (
                        <NavLink href={'/trade'}>
                          <a
                            id={`trade-nav-link`}
                            className={classNames(navLinkStyle, routeTag === "trade" ? navDarkBorder : navLightBorder)}
                          >
                            {i18n._(t`Trade`)}
                          </a>
                        </NavLink>
                      )}
                      {chainId && featureEnabled(Feature.veCRONA, chainId) && (
                        <NavLink href={'/veCRONA'}>
                          <a
                            id={`veCRONA-nav-link`}
                            className={classNames(navLinkStyle, routeTag === "veCRONA" ? navDarkBorder : navLightBorder)}
                          >
                            {i18n._(t`veCRONA`)}
                          </a>
                        </NavLink>
                      )}
                      {chainId && featureEnabled(Feature.veCRONA, chainId) && (
                        <NavLink href={'/claim'}>
                          <a
                            id={`claim-nav-link`}
                            className={classNames(navLinkStyle, routeTag === "claim" ? navDarkBorder : navLightBorder)}
                          >
                            {i18n._(t`Claim`)}
                            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-4" data-v-8d39fa2a="" data-v-3eef92de-s=""><defs><linearGradient id="stars-gradient-yellow-pink" x1="24" y1="-11.5" x2="2.7273" y2="16.3182" gradientUnits="userSpaceOnUse"><stop stopColor="#f21bf6"></stop><stop offset="1" stopColor="#FED533"></stop></linearGradient></defs><path fillRule="evenodd" clipRule="evenodd" d="M21.7809 7.27232C20.6203 7.70216 19.7081 8.67468 19.305 9.91198L18.5527 12.2203C18.5419 12.2555 18.5111 12.2792 18.4764 12.2792C18.4417 12.2792 18.4109 12.2555 18.4001 12.2203L17.6479 9.91198C17.2447 8.67461 16.3323 7.70207 15.1716 7.27232L13.0065 6.47049C12.9742 6.45851 12.9525 6.42606 12.9525 6.38961C12.9525 6.35316 12.9742 6.32071 13.0065 6.30873L15.1716 5.5069C16.3323 5.07715 17.2447 4.10461 17.6479 2.86724L18.4001 0.558892C18.4109 0.523752 18.4417 0.5 18.4764 0.5C18.5111 0.5 18.5419 0.523752 18.5527 0.558892L19.305 2.86724C19.7081 4.10455 20.6203 5.07707 21.7809 5.5069L23.9461 6.30873C23.9783 6.32071 24 6.35316 24 6.38961C24 6.42606 23.9783 6.45851 23.9461 6.47049L21.7809 7.27232ZM12.2613 14.4746C10.6494 15.0717 9.38251 16.4224 8.82264 18.1409L7.77749 21.3469C7.76214 21.3952 7.71964 21.4276 7.67183 21.4276C7.62402 21.4276 7.58152 21.3952 7.56617 21.3469L6.52102 18.1409C5.96115 16.4224 4.69427 15.0717 3.08238 14.4746L0.0748959 13.361C0.0300526 13.3443 0 13.2993 0 13.2486C0 13.198 0.0300526 13.153 0.0748959 13.1363L3.08238 12.0227C4.69428 11.4256 5.96116 10.0749 6.52102 8.35643L7.56617 5.1504C7.58152 5.10213 7.62402 5.06965 7.67183 5.06965C7.71964 5.06965 7.76214 5.10213 7.77749 5.1504L8.82264 8.35643C9.38251 10.0749 10.6494 11.4256 12.2613 12.0227L15.2688 13.1363C15.3136 13.153 15.3437 13.198 15.3437 13.2486C15.3437 13.2993 15.3136 13.3443 15.2688 13.361L12.2613 14.4746ZM18.4025 22.6042C18.725 21.6144 19.4546 20.8364 20.383 20.4924L22.1159 19.851C22.1417 19.8414 22.1591 19.8154 22.1591 19.7862C22.1591 19.7571 22.1417 19.7311 22.1159 19.7215L20.383 19.0801C19.4546 18.7361 18.725 17.9581 18.4025 16.9683L17.8005 15.1217C17.7925 15.0925 17.7674 15.0725 17.7389 15.0725C17.7104 15.0725 17.6853 15.0925 17.6773 15.1217L17.0768 16.9683C16.754 17.9585 16.0237 18.7365 15.0948 19.0801L13.3634 19.7215C13.3376 19.7311 13.3202 19.7571 13.3202 19.7862C13.3202 19.8154 13.3376 19.8414 13.3634 19.851L15.0948 20.4924C16.0237 20.836 16.754 21.614 17.0768 22.6042L17.6773 24.4509C17.6853 24.48 17.7104 24.5 17.7389 24.5C17.7674 24.5 17.7925 24.48 17.8005 24.4509L18.4025 22.6042Z" fill="url(#stars-gradient-yellow-pink)"></path></svg>
                          </a>
                        </NavLink>
                      )}
                    </div>
                  </div>
                </div>

                <div className="fixed bottom-0 left-0 z-10 flex flex-row items-center justify-center w-full p-4 lg:w-auto bg-gray-50/80 dark:bg-gray-800/80 transition-all lg:relative lg:p-0 backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent dark:lg:bg-transparent">
                  <div className="flex items-center justify-between w-full space-x-2 sm:justify-end">
                    <ColorSwith />
                    <div className="flex items-center w-auto mr-1 text-xs font-bold rounded shadow-sm cursor-pointer pointer-events-auto select-none whitespace-nowrap sm:block">
                      <TokenStats token="CRONA" />
                    </div>
                    {library && library.provider.isMetaMask && (
                      <div className="hidden sm:inline-block">
                        <Web3Network />
                      </div>
                    )}

                    <div className="w-auto flex items-center rounded bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-50 shadow-md hover:opacity-80 transition-color p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
                      {account && chainId && userEthBalance && (
                        <>
                          <div className="px-3 py-2 text-bold">
                            {userEthBalance?.toSignificant(4)} {NATIVE[chainId].symbol}
                          </div>
                        </>
                      )}
                      <Web3Status />
                    </div>
                    {/* <div className="hidden md:block">
                      <LanguageSwitch />
                    </div> */}
                    <More />
                  </div>
                </div>
                <div className="flex -mr-2 sm:hidden">
                  {/* Mobile menu button */}
                  {/* <div className="block mr-2 md:hidden">
                    <LanguageSwitch />
                  </div> */}
                  <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 dark:text-gray-50 opacity-100 hover:opacity-60 transition-all">
                    <span className="sr-only">{i18n._(t`Open main menu`)}</span>
                    {open ? (
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      // <X title="Close" className="block w-6 h-6" aria-hidden="true" />
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                      // <Burger title="Burger" className="block w-6 h-6" aria-hidden="true" />
                    )}
                  </Popover.Button>
                </div>
              </div>
            </div>

            <Popover.Panel className="sm:hidden">
              <div className="flex flex-col px-4 pt-2 pb-3 space-y-1">
                {chainId && featureEnabled(Feature.INVEST, chainId) && (
                  <Link href={'/invest'}>
                    <a
                      id={`invest-nav-link`}
                      className={classNames(navLinkStyle, routeTag === "invest" ? navDarkBorder : navLightBorder)}
                    >
                      {' '}
                      {i18n._(t`Invest`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.TRADE, chainId) && (
                  <Link href={'/trade'}>
                    <a
                      id={`trade-nav-link`}
                      className={classNames(navLinkStyle, routeTag === "trade" ? navDarkBorder : navLightBorder)}
                    >
                      {' '}
                      {i18n._(t`Trade`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.veCRONA, chainId) && (
                  <Link href={'/veCRONA'}>
                    <a
                      id={`veCRONA-nav-link`}
                      className={classNames(navLinkStyle, routeTag === "veCRONA" ? navDarkBorder : navLightBorder)}
                    >
                      {' '}
                      {i18n._(t`veCRONA`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.CLAIM, chainId) && (
                  <Link href={'/claim'}>
                    <a
                      id={`claim-nav-link`}
                      className={classNames(navLinkStyle, routeTag === "claim" ? navDarkBorder : navLightBorder)}
                    >
                      {i18n._(t`Claim`)}
                      <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-4" data-v-8d39fa2a="" data-v-3eef92de-s=""><defs><linearGradient id="stars-gradient-yellow-pink" x1="24" y1="-11.5" x2="2.7273" y2="16.3182" gradientUnits="userSpaceOnUse"><stop stopColor="#f21bf6"></stop><stop offset="1" stopColor="#FED533"></stop></linearGradient></defs><path fillRule="evenodd" clipRule="evenodd" d="M21.7809 7.27232C20.6203 7.70216 19.7081 8.67468 19.305 9.91198L18.5527 12.2203C18.5419 12.2555 18.5111 12.2792 18.4764 12.2792C18.4417 12.2792 18.4109 12.2555 18.4001 12.2203L17.6479 9.91198C17.2447 8.67461 16.3323 7.70207 15.1716 7.27232L13.0065 6.47049C12.9742 6.45851 12.9525 6.42606 12.9525 6.38961C12.9525 6.35316 12.9742 6.32071 13.0065 6.30873L15.1716 5.5069C16.3323 5.07715 17.2447 4.10461 17.6479 2.86724L18.4001 0.558892C18.4109 0.523752 18.4417 0.5 18.4764 0.5C18.5111 0.5 18.5419 0.523752 18.5527 0.558892L19.305 2.86724C19.7081 4.10455 20.6203 5.07707 21.7809 5.5069L23.9461 6.30873C23.9783 6.32071 24 6.35316 24 6.38961C24 6.42606 23.9783 6.45851 23.9461 6.47049L21.7809 7.27232ZM12.2613 14.4746C10.6494 15.0717 9.38251 16.4224 8.82264 18.1409L7.77749 21.3469C7.76214 21.3952 7.71964 21.4276 7.67183 21.4276C7.62402 21.4276 7.58152 21.3952 7.56617 21.3469L6.52102 18.1409C5.96115 16.4224 4.69427 15.0717 3.08238 14.4746L0.0748959 13.361C0.0300526 13.3443 0 13.2993 0 13.2486C0 13.198 0.0300526 13.153 0.0748959 13.1363L3.08238 12.0227C4.69428 11.4256 5.96116 10.0749 6.52102 8.35643L7.56617 5.1504C7.58152 5.10213 7.62402 5.06965 7.67183 5.06965C7.71964 5.06965 7.76214 5.10213 7.77749 5.1504L8.82264 8.35643C9.38251 10.0749 10.6494 11.4256 12.2613 12.0227L15.2688 13.1363C15.3136 13.153 15.3437 13.198 15.3437 13.2486C15.3437 13.2993 15.3136 13.3443 15.2688 13.361L12.2613 14.4746ZM18.4025 22.6042C18.725 21.6144 19.4546 20.8364 20.383 20.4924L22.1159 19.851C22.1417 19.8414 22.1591 19.8154 22.1591 19.7862C22.1591 19.7571 22.1417 19.7311 22.1159 19.7215L20.383 19.0801C19.4546 18.7361 18.725 17.9581 18.4025 16.9683L17.8005 15.1217C17.7925 15.0925 17.7674 15.0725 17.7389 15.0725C17.7104 15.0725 17.6853 15.0925 17.6773 15.1217L17.0768 16.9683C16.754 17.9585 16.0237 18.7365 15.0948 19.0801L13.3634 19.7215C13.3376 19.7311 13.3202 19.7571 13.3202 19.7862C13.3202 19.8154 13.3376 19.8414 13.3634 19.851L15.0948 20.4924C16.0237 20.836 16.754 21.614 17.0768 22.6042L17.6773 24.4509C17.6853 24.48 17.7104 24.5 17.7389 24.5C17.7674 24.5 17.7925 24.48 17.8005 24.4509L18.4025 22.6042Z" fill="url(#stars-gradient-yellow-pink)"></path></svg>
                    </a>
                  </Link>
                )}

                {/* {chainId && featureEnabled(Feature.ANALYTICS, chainId) && (
                  <ExternalLink
                    id={`analytics-nav-link`}
                    href={ANALYTICS_URL[chainId] || 'https://analytics.x.com'}
                    className="p-2 text-baseline opacity-60 hover:opacity-100 active:opacity-100transition-all text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Analytics`)}
                  </ExternalLink>
                )} */}
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </header >
  )
}

export default AppBar
