import { Currency, Token, ChainId, NATIVE } from '@cronaswap/core-sdk'
import { useMemo, useEffect, useState } from 'react'
import { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useActiveWeb3React } from 'app/services/web3'
import axios from 'axios';
import { format, fromUnixTime, getUnixTime, startOfHour } from 'date-fns';
import { groupBy, invert, last, result, mapValues, mapKeys, pickBy, Dictionary, toPairs } from 'lodash';

import { retryPromiseWithDelay } from 'app/functions/promise'
import { number } from '@lingui/core/cjs/formats'
import { twentyFourHoursInSecs } from 'app/hooks/useTime'
import QuestionHelper from '../QuestionHelper'
import Button from '../Button'

export const getNativeAssetId = (chainId: string): string => {
  ChainId.BSC
  const mapping = {
    '25': 'crypto-com-chain',
    '338': 'crypto-com-chain',
    '56': 'binancecoin',
    '97': 'binancecoin'
  };

  return mapping[chainId] || 'crypto-com-chain';
};

export const getPlatformId = (chainId: string): string => {
  const mapping = {
    '25': 'cronos',
    '338': 'cronos',
    '56': 'binance-smart-chain',
    '97': 'binance-smart-chain'
  };

  return mapping[chainId] || 'cronos';
};

const chartTimespans = [
  {
    option: '24h',
    value: 1
  },
  {
    option: '1w',
    value: 7
  },
  {
    option: '1m',
    value: 30
  },
  {
    option: '1y',
    value: 365
  },
  {
    option: 'All',
    value: 4000
  }
];

export type Price = { [fiat: string]: number };
export type PriceResponse = { [id: string]: Price };
export type TokenPrices = { [address: string]: Price };

export interface HistoricalPriceResponse {
  market_caps: number[][];
  prices: number[][];
  total_volumes: number[][];
}
export type HistoricalPrices = { [timestamp: string]: number[] }

const TradeChart = ({
  currencies
}: {
  currencies: (Currency | undefined)[]
}) => {
  const [chartDates, setChartDates] = useState<any>([])
  const [chartData, setChartData] = useState<any>([])
  const { chainId } = useActiveWeb3React()

  const fiatParam = 'usd'
  const nativeAssetId = getNativeAssetId(chainId.toString())
  const platformId = getPlatformId(chainId.toString())
  const nativeAssetAddress = NATIVE[chainId].wrapped.address
  const inputAddress = useMemo(() => currencies[0]?.wrapped.address, [currencies[0]])
  const outputAddress = useMemo(() => currencies[1]?.wrapped.address, [currencies[1]])

  const aggregateBy = 'hour'
  const [days, setDays] = useState(1);

  const now = Math.floor(Date.now() / 1000);
  const end = aggregateBy === 'hour' ? now : now - (now % twentyFourHoursInSecs);
  const start = useMemo(() => end - days * twentyFourHoursInSecs, [days]);

  const getPrices = async () => {
    const requests: Promise<any>[] = [];
    try {
      const addresses = [inputAddress, outputAddress]
      addresses.forEach(address => {
        const endpoint = `/coins/${platformId
          }/contract/${address}/market_chart/range?vs_currency=${fiatParam}&from=${start}&to=${end}`;
        const request = retryPromiseWithDelay(
          axios.get(`https://api.coingecko.com/api/v3${endpoint}`),
          2, // retryCount
          1000 // delayTime0
        );
        requests.push(request);
      });

      const paginatedResults = await Promise.all(requests);

      const results = parseHistoricalPrices(
        paginatedResults,
        [inputAddress, outputAddress],
        start,
        aggregateBy
      );

      var dates = []
      var data = []

      const calculatedPricing = mapValues(results, (value, timestamp) => {
        var _rate = (1 / value[0]) * value[1]
        _rate = _rate ? _rate : 0
        data.push(_rate)
        return _rate;
      });

      const calculatedPricingNoNulls = pickBy(calculatedPricing) as Dictionary<number>;

      const formatTimestamps = mapKeys(
        calculatedPricingNoNulls,
        (value: any, timestamp: any) => {
          // if (value === undefined || value === NaN) return
          dates.push(format(fromUnixTime(timestamp / 1000), 'yyyy/MM/dd HH:mm'))
          return format(fromUnixTime(timestamp / 1000), 'yyyy/MM/dd HH:mm')
        }
      );

      setChartDates(dates)
      setChartData(data)
    } catch (e) {

      setChartDates([])
      setChartData([])
      console.log(e);
    }
  }

  const parseHistoricalPrices = (
    results: any,
    addresses: string[],
    start: number,
    aggregateBy: 'day' | 'hour' = 'day'
  ): HistoricalPrices => {
    const assetPrices = Object.fromEntries(
      addresses.map((address, index) => {
        try {
          const result = results[index]?.data?.prices;
          const prices = {};
          let dayTimestamp = start;
          if (aggregateBy === 'hour') {
            const pricesByHour = groupBy(result, r =>
              getUnixTime(startOfHour(fromUnixTime(r[0] / 1000)))
            );
            for (const key of Object.keys(pricesByHour)) {
              const price = (last(pricesByHour[key]) || [])[1] || 0;
              prices[Number(key) * 1000] = price;
            }
          } else if (aggregateBy === 'day') {
            for (const key in result) {
              const value = result[key];
              const [timestamp, price] = value;
              if (timestamp > dayTimestamp * 1000) {
                prices[dayTimestamp * 1000] = price;
                dayTimestamp += twentyFourHoursInSecs;
              }
            }
          }
          return [address, prices];
        } catch (e) {
          console.log(e)
        }
      })
    );

    const prices = {};
    for (const asset in assetPrices) {
      const assetPrice = assetPrices[asset];
      for (const timestamp in assetPrice) {
        const price = assetPrice[timestamp];
        if (!(timestamp in prices)) {
          prices[timestamp] = [];
        }
        prices[timestamp].push(price);
      }
    }
    return prices;
  }

  useEffect(() => {
    if (chainId === undefined || inputAddress === undefined || outputAddress === undefined) return
    getPrices()
  }, [chainId, inputAddress, outputAddress, days])

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        type: 'shadow',
        backgroundColor: 'rgba(24, 24, 46, 0.95)',
        borderColor: 'transparent',
        fontSize: '12px',
        borderRadius: 8,
        textStyle: {
          color: 'white',
        },
        padding: 16,
        axisPointer: {
          animation: true,
          type: 'cross',
          lineStyle: {
            color: '#376df4',
            width: 1,
            opacity: 1,
          },
        },
      },
      xAxis: {
        type: 'category',
        data: chartDates,
        axisLine: { lineStyle: { color: '#8392A5' } },
      },
      yAxis: {
        scale: true,
        axisLine: { lineStyle: { color: '#8392A5' } },
        splitLine: { show: false },
      },
      /*grid: {
          bottom: 80,
      },*/
      width: '100%',
      grid: {
        left: 0,
        right: 0,
        top: '2%',
        bottom: 0,
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          type: 'line',
          name: `${currencies[0]?.symbol} / ${currencies[1]?.symbol}`,
          smooth: true,
          data: chartData,
          itemStyle: {
            color: '#FD1050',
            color0: '#0CF49B',
            borderColor: '#FD1050',
            borderColor0: '#0CF49B',
          },
        },
      ],
    }),
    [days, chartData, chartDates],
  );

  console.log(chartData[chartData.length - 1], chartData[0])
  return (<div className='flex-row justify-center w-full space-y-1'>
    <div className='flex text-base gap-2'>{currencies[0]?.symbol} / {currencies[1]?.symbol} <QuestionHelper text="The data for this graph is pulled from our pricing provider, CoinGecko."><img className="h-5" src="/images/pages/trade/coingecko.svg" /></QuestionHelper></div>
    {chartData[chartData.length - 1] !== undefined && <div className='flex text-xl font-bold'>{chartData[chartData.length - 1].toFixed(4)}</div>}
    {chartData[chartData.length - 1] !== undefined && <div className={`flex text-base ${chartData[chartData.length - 1] - chartData[0] >= 0 ? 'text-green' : 'text-red'}`}>{Number(chartData[chartData.length - 1] - chartData[0]) > 0 ? '+' : ''}{Number(chartData[chartData.length - 1] - chartData[0]).toFixed(3)} %</div>}
    <div className='flex items-center justify-center text-sm h-[220px]'>{chartData[0] === undefined ? <div className="opacity-50 mt-8">Not Enough data</div> : <ReactECharts option={option} style={{ width: '100%', height: '220px' }} />}</div>
    {chartData[chartData.length - 1] !== undefined && <div className='flex flex-wrap pt-1 transition-all gap-2'>
      {chartTimespans.map((item, idx) =>
        <Button key={idx} className='bg-gray-850/20 dark:bg-gray-100/10 shadow text-xs' size='sm' onClick={() => setDays(item.value)}>{item.option}</Button>
      )}
    </div>
    }
  </div>)
}

export default TradeChart