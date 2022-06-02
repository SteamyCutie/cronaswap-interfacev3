import { ChainId } from '@cronaswap/core-sdk'

export enum Feature {
  INVEST = 'Invest',
  TRADE = 'Trade',
  veCRONA = 'veCRONA',
  CLAIM = 'Claim',
}

const features = {
  [ChainId.ETHEREUM]: [Feature.INVEST],

  [ChainId.CRONOS]: [
    Feature.INVEST,
    Feature.TRADE,
    Feature.veCRONA,
    Feature.CLAIM,
  ],

  [ChainId.CRONOS_TESTNET]: [
    Feature.INVEST,
    Feature.TRADE,
    Feature.veCRONA,
    Feature.CLAIM,
  ],

  [ChainId.BSC_TESTNET]: [
    Feature.INVEST,
    Feature.TRADE,
    Feature.veCRONA,
    Feature.CLAIM,
  ],
}

export function featureEnabled(feature: Feature, chainId: ChainId): boolean {
  return features?.[chainId]?.includes(feature)
}

export function chainsWithFeature(feature: Feature): ChainId[] {
  return Object.keys(features)
    .filter((chain) => features[chain].includes(feature))
    .map((chain) => ChainId[chain])
}
