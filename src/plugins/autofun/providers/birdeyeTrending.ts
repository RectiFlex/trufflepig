import type { IAgentRuntime, Memory, Provider, State } from '@elizaos/core';
import type { IToken } from '../types';
import { logger } from '@sentry/browser';

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
 * @param {IAgentRuntime} runtime - The agent runtime
 * @param {Memory} message - The message memory
 * @param {State} state - The state of the agent
 * @returns {Object} Object containing data, values, and text related to actions
 */
export const birdeyeTrendingProvider: Provider = {
  name: 'INTEL_TRENDING',
  description: 'A list of trending solana tokens from the onchain and off-chain data aggregators',
  dynamic: true,
  //position: -1,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    console.log('intel:provider - get birdeye');

    // Get all sentiments
    const chains = ['solana', 'base'];

    //console.log('intel:provider - birdeye data', tokens)
    const solanaTokens: IToken[] = (await runtime.getCache<IToken[]>('tokens_solana')) || [];
    const baseTokens: IToken[] = (await runtime.getCache<IToken[]>('tokens_base')) || [];

    const combinedTokens: IToken[] = [...solanaTokens, ...baseTokens];

    //console.log('intel:provider - birdeye token data', tokens)
    if (!combinedTokens.length) {
      return {
        data: { tokens: [] },
        values: {},
        text: 'No trending tokens found.',
      };
    }

    // get holders

    let latestTxt = '\nCurrent trending list of all cryptocurrencies with latest market data:\n';
    let idx = 1;
    for (const t of combinedTokens) {
      const rank = t.rank || idx;
      const name = t.name || 'Unknown';
      const symbol = t.symbol || '?';
      const priceUsd = t.price?.toFixed(10) || '0';
      const volume24hUSD = t.volume24hUSD?.toFixed(2) || '0';
      const price24hChangePercent = t.price24hChangePercent?.toFixed(2) || '0';
      const liquidity = t.liquidity?.toFixed(2) || '0';  // Use optional chaining
      const marketcap = t.marketcap?.toFixed(2) || '0';  // Use optional chaining

      latestTxt += `RANK ${rank}: ${name} (${symbol}) - Price: $${priceUsd}, Volume 24h: $${volume24hUSD}, Change 24h: ${price24hChangePercent}%, Liquidity: $${liquidity}, Market Cap: $${marketcap}\n`;
      idx++;
    }

    //console.log('intel:provider - cmc token text', latestTxt)

    const data = {
      tokens: combinedTokens,
    };

    const values = {};

    // Combine all text sections
    const text = latestTxt + '\n';

    return {
      data,
      values,
      text,
    };
  },
};
