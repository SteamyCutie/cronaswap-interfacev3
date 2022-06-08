import { useMemo } from 'react'
import { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'

import rawData from './randomdata.json'

const TradeChart = () => {
  const dates = rawData.map((item: any[]) => item[0])
  const data = rawData.map((item: (string | number)[]) => [+item[1], +item[2], +item[5], +item[6]])

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        type: 'shadow',
        backgroundColor: 'rgba(24, 24, 46, 0.95)',
        borderColor: 'transparent',
        borderRadius: 8,
        textStyle: {
          color: 'white',
        },
        padding: 16,
        axisPointer: {
          animation: false,
          type: 'cross',
          lineStyle: {
            color: '#376df4',
            width: 2,
            opacity: 1,
          },
        },
      },
      xAxis: {
        type: 'category',
        data: dates,
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
          start: 40,
          end: 60,
        },
      ],
      series: [
        {
          type: 'candlestick',
          name: 'Day',
          data: data,
          itemStyle: {
            color: '#FD1050',
            color0: '#0CF49B',
            borderColor: '#FD1050',
            borderColor0: '#0CF49B',
          },
        },
      ],
    }),
    [],
  );

  return (<div className='flex items-center justify-center w-full'><ReactECharts option={option} style={{ width: '100%', height: '100%' }} /></div>)
}

export default TradeChart