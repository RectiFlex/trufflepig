// TODO: Replace with cache adapter

import { type IAgentRuntime, type Memory, type Route, createUniqueUuid } from '@elizaos/core';

import { SentimentArraySchema, TweetArraySchema } from './schemas';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Portfolio, SentimentContent, TransactionHistory } from './tasks/birdeye';
import type { IToken } from './types';

// Define the equivalent of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Definition of routes with type, path, and handler for each route.
 * Autofun-specific routes only to avoid conflicts with degenIntel
 */

export const routes: Route[] = [
  {
    type: 'GET',
    path: '/autofun-test',
    public: true,
    name: 'Autofun Test',
    handler: async (_req: any, res: any) => {
      res.json({ message: 'Autofun routes are working!', timestamp: new Date().toISOString() });
    },
  },
  {
    type: 'POST',
    path: '/autofun/portfolio',
    public: true,
    name: 'Autofun Portfolio',
    handler: async (_req: any, res: any, runtime) => {
      try {
        const cachedPortfolio = await runtime.getCache<Portfolio>('portfolio');
        const portfolio = cachedPortfolio ? cachedPortfolio : { key: 'PORTFOLIO', data: null };
        res.json(portfolio.data);
      } catch (_error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  },
  {
    type: 'POST',
    path: '/autofun/transactions',
    public: true,
    name: 'Autofun Transactions',
    handler: async (_req: any, res: any, runtime) => {
      try {
        const cachedTxs = await runtime.getCache<TransactionHistory[]>('transaction_history');
        const transactions: TransactionHistory[] = cachedTxs ? cachedTxs : [];
        const history = transactions
          .filter((tx) => tx.data.mainAction === 'received')
          .sort((a, b) => new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime())
          .slice(0, 100);
        res.json(history);
      } catch (_error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  },
];

export default routes;
