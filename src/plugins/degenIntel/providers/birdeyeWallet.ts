import type { IAgentRuntime, Memory, Provider, State } from '@elizaos/core';
import { Portfolio, TransactionHistory } from '../tasks/birdeye';

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
export const birdeyeWalletProvider: Provider = {
  name: 'INTEL_BIRDEYE_WALLET',
  description: 'A wallet provider that gives the current wallet portfolio and recent transactions',
  dynamic: true,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    const portfolioData = (await runtime.getCache<Portfolio>('portfolio')) || { key: 'PORTFOLIO', data: null };

    if (!portfolioData?.data) {
      return {
        data: { portfolio: {}, trades: [] },
        values: {},
        text: 'No wallet portfolio data available.',
      };
    }

    const trades = (await runtime.getCache<TransactionHistory[]>('transaction_history')) || [];

    const portfolioText = `Current Portfolio:\n${JSON.stringify(portfolioData.data, null, 2)}\n\n`;
    const tradesText = `Recent Transactions:\n${JSON.stringify(trades.slice(0, 5), null, 2)}`;

    return {
      data: { portfolio: portfolioData.data, trades },
      values: {},
      text: portfolioText + tradesText,
    };
  },
};

export default birdeyeWalletProvider;
