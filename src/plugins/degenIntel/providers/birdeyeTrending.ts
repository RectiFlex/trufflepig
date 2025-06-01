import type { IAgentRuntime, Memory, Provider, State } from '@elizaos/core';
import { logger } from '@elizaos/core';
import type { IToken } from '../types';

/**
 * Provider for Birdeye trending coins
 *
 * @typedef {import('./Provider').Provider} Provider
 * @typedef {import('./Runtime').IAgentRuntime} IAgentRuntime
 * @typedef {import('./Memory').Memory} Memory
 * @typedef {import('./State').State} State
 * @typedef {import('./Action').Action} Action
 *
 * @type {Provider}
 * @property {string} name - The name of the provider
 * @property {string} description - Description of the provider
 * @property {number} position - The position of the provider
 * @property {Function} get - Asynchronous function to get actions that validate for a given message
 *
 * @param {IAgentRuntime} runtime - The runtime environment
 * @param {Memory} message - The memory object
 * @param {State} state - The state object
 * @returns {Promise<string>} - The provider response
 */
export const birdeyeTrendingProvider: Provider = {
  name: 'INTEL_BIRDEYE',
  description: 'A list of trending solana tokens from the Birdeye REST API',
  dynamic: true,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    const tokens = (await runtime.getCache<IToken[]>('tokens_solana')) || [];

    if (!tokens || tokens.length === 0) {
      logger.warn('No tokens found in cache for Birdeye trending');
      return {
        data: { tokens: [] },
        values: {},
        text: 'No trending tokens available at the moment.',
      };
    }

    const combinedTokens = tokens.slice(0, 10);

    let latestTxt = 'Trending Tokens (Birdeye):\n\n';
    let idx = 1;

    for (const t of combinedTokens) {
      const rank = t.rank || idx;
      const name = t.name || 'Unknown';
      const symbol = t.symbol || '?';
      const priceUsd = t.price?.toFixed(10) || '0';
      const volume24hUSD = t.volume24hUSD?.toFixed(2) || '0';
      const price24hChangePercent = t.price24hChangePercent?.toFixed(2) || '0';
      const liquidity = t.liquidity?.toFixed(2) || '0';
      const marketcap = t.marketcap?.toFixed(2) || '0';

      latestTxt += `RANK ${rank}: ${name} (${symbol}) - Price: $${priceUsd}, Volume 24h: $${volume24hUSD}, Change 24h: ${price24hChangePercent}%, Liquidity: $${liquidity}, Market Cap: $${marketcap}\n`;
      idx++;
    }

    return {
      data: { tokens: combinedTokens },
      values: {},
      text: latestTxt,
    };
  },
};

export default birdeyeTrendingProvider;
