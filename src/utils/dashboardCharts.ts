import { DualAxes, Funnel, Gauge, Column } from '@antv/g2plot'
import type { SlaTrendPoint, ReviewFunnelNode, RiskSourceStackPoint } from '../types/dashboard'

type PlotInstance = {
  render: () => void
  destroy: () => void
  changeData: (data: unknown) => void
  update: (options: Record<string, unknown>) => void
  on: (event: string, cb: (evt: { data?: { data?: Record<string, unknown> } }) => void) => void
}

const bindResize = (plot: PlotInstance) => {
  const handler = () => {
    plot.update({})
  }
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}

export const createGaugeChart = (container: HTMLElement, score: number, dark: boolean) => {
  const plot = new Gauge(container, {
    percent: Math.max(0, Math.min(score / 100, 1)),
    range: { color: dark ? '#1f2937' : '#e5e7eb' },
    indicator: {
      pointer: {
        style: { stroke: dark ? '#93c5fd' : '#2563eb' },
      },
      pin: {
        style: { stroke: dark ? '#1d4ed8' : '#1e40af' },
      },
    },
    statistic: {
      title: { formatter: () => '治理健康分' },
      content: {
        style: { fontSize: '28px', fontWeight: 700 },
        formatter: () => `${score}`,
      },
    },
    gaugeStyle: { lineCap: 'round' },
  })
  plot.render()
  const disposeResize = bindResize(plot as unknown as PlotInstance)
  return {
    plot,
    destroy: () => {
      disposeResize()
      plot.destroy()
    },
  }
}

export const createSlaDualAxesChart = (container: HTMLElement, data: SlaTrendPoint[], dark: boolean) => {
  const plot = new DualAxes(container, {
    data: [data, data],
    xField: 'date',
    yField: ['riskOrders', 'timeoutRate'],
    geometryOptions: [
      {
        geometry: 'column',
        color: dark ? '#60a5fa' : '#2563eb',
        columnWidthRatio: 0.46,
      },
      {
        geometry: 'line',
        color: '#f97316',
        smooth: true,
        lineStyle: { lineWidth: 2.5 },
      },
    ],
    yAxis: {
      riskOrders: { min: 0 },
      timeoutRate: {
        min: 0,
        label: {
          formatter: (v: string) => `${v}%`,
        },
      },
    },
    tooltip: { shared: true },
    legend: {
      itemName: {
        formatter: (name: string) => (name === 'riskOrders' ? '风险单量' : '超时率'),
      },
    },
  })
  plot.render()
  const disposeResize = bindResize(plot as unknown as PlotInstance)
  return {
    plot,
    destroy: () => {
      disposeResize()
      plot.destroy()
    },
  }
}

export const createReviewFunnelChart = (container: HTMLElement, data: ReviewFunnelNode[], dark: boolean) => {
  const palette = dark ? ['#60a5fa', '#22d3ee', '#fbbf24', '#c084fc', '#34d399'] : ['#3b82f6', '#0ea5e9', '#f59e0b', '#a855f7', '#10b981']
  const plot = new Funnel(container, {
    data: data.map((item) => ({
      stage:
        item.stage === 'submitted'
          ? '提交'
          : item.stage === 'in_review'
            ? '审核中'
            : item.stage === 'need_fix_rejected'
              ? '补件/驳回'
              : item.stage === 'resubmitted'
                ? '重提'
                : '通过',
      value: item.value,
    })),
    xField: 'stage',
    yField: 'value',
    dynamicHeight: true,
    conversionTag: {},
    color: palette,
  })
  plot.render()
  const disposeResize = bindResize(plot as unknown as PlotInstance)
  return {
    plot,
    destroy: () => {
      disposeResize()
      plot.destroy()
    },
  }
}

export const createRiskSourceStackChart = (container: HTMLElement, data: RiskSourceStackPoint[], dark: boolean) => {
  const plot = new Column(container, {
    data,
    isStack: true,
    xField: 'date',
    yField: 'count',
    seriesField: 'source',
    color: ({ source }) => {
      const palette: Record<RiskSourceStackPoint['source'], string> = {
        商品合规: dark ? '#60a5fa' : '#2563eb',
        履约: dark ? '#34d399' : '#10b981',
        售后: '#f59e0b',
        财务: '#8b5cf6',
        风控规则: '#ef4444',
      }
      return palette[source as RiskSourceStackPoint['source']]
    },
    label: false,
    legend: { position: 'top' },
    tooltip: { shared: true },
  })
  plot.render()
  const disposeResize = bindResize(plot as unknown as PlotInstance)
  return {
    plot,
    destroy: () => {
      disposeResize()
      plot.destroy()
    },
  }
}
