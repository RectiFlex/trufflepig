import type { Action, IAgentRuntime, Memory, Provider, State } from '@elizaos/core';
import { addHeader, composeActionExamples, formatActionNames, formatActions } from '@elizaos/core';
import type { IToken } from '../types';

/**
 * Provider for CMC latest coins
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
export const cmcMarketProvider: Provider = {
  name: 'INTEL_CMC_MARKET',
  description: 'A list of trending cryptocurrencies from coinmarketcap',
  dynamic: true,
  //position: -1,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    // Get all sentiments
    const chains = ['solana', 'base'];
    const tokens: IToken[] = (await runtime.getCache<IToken[]>('tokens_solana')) || [];

    //console.log('intel:provider - cmc tokens', sentimentData.length, 'records')
    if (!tokens.length) {
      return {
        data: { tokens: [] },
        values: {},
        text: 'No CMC market data found.',
      };
    }

    //console.log('CMC token data', tokens)

    // get holders

    let latestTxt = '\nCurrent coinmarketcap list of all cryptocurrencies with latest market data:\n';
    let idx = 1;
    for (const t of tokens) {
      const rank = t.rank || idx;
      const name = t.name || 'Unknown';
      const symbol = t.symbol || '?';
      const price = t.price?.toFixed(10) || '0';
      const volume24hUSD = t.volume24hUSD?.toFixed(2) || '0';
      const price24hChangePercent = t.price24hChangePercent?.toFixed(2) || '0';
      const liquidity = t.liquidity?.toFixed(2) || '0';
      const marketcap = t.marketcap?.toFixed(2) || '0';

      latestTxt += `RANK ${rank}: ${name} (${symbol}) - Price: $${price}, Volume 24h: $${volume24hUSD}, Change 24h: ${price24hChangePercent}%, Liquidity: $${liquidity}, Market Cap: $${marketcap}\n`;
      idx++;
    }

    //console.log('intel:provider - cmc token text', latestTxt)

    const data = {
      tokens,
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
