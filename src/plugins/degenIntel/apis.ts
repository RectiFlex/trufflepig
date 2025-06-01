// TODO: Replace with cache adapter

import { type IAgentRuntime, type Memory, type Route, createUniqueUuid } from '@elizaos/core';
import type { IToken, ITransactionHistory, Sentiment } from './types';

import { SentimentArraySchema, TweetArraySchema } from './schemas';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Define the equivalent of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * API routes for the DegenIntel plugin
 * These endpoints provide data for the frontend dashboard
 */

export const routes: Route[] = [
  {
    type: 'GET',
    path: '/degenintel-test',
    public: true,
    name: 'Degen Intel Test',
    handler: async (_req: any, res: any) => {
      res.json({
        message: 'DegenIntel API test endpoint working!',
        timestamp: new Date().toISOString(),
        endpoints: [
          'POST /trending - Get trending tokens',
          'POST /wallet - Get wallet information',
          'GET /tweets - Get tweets data',
          'GET /sentiment - Get sentiment analysis',
          'POST /statistics - Get trading statistics',
          'GET /config - Get wallet configuration',
          'GET /portfolio - Get multi-chain portfolio'
        ]
      });
    },
  },
  {
    type: 'POST',
    path: '/wallet',
    public: true,
    name: 'Wallet Information',
    handler: async (_req: any, res: any, runtime) => {
      try {
        // Get wallet portfolio from cache or provider
        const portfolioData = await runtime.getCache('portfolio') as any;
        const transactionHistory = await runtime.getCache('transaction_history') as ITransactionHistory[];
        
        if (portfolioData && portfolioData.data) {
          return res.json({
            address: runtime.getSetting('SOLANA_PUBLIC_KEY'),
            portfolio: portfolioData.data,
            history: transactionHistory || [],
            totalUsd: portfolioData.data.totalUsd || 0,
            tokens: portfolioData.data.items || []
          });
        }

        return res.json({ 
          address: runtime.getSetting('SOLANA_PUBLIC_KEY') || 'Not configured',
          portfolio: null, 
          history: [],
          totalUsd: 0,
          tokens: []
        });
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        return res.status(500).json({ error: 'Failed to fetch wallet data' });
      }
    },
  },
  {
    type: 'GET',
    path: '/config',
    public: true,
    name: 'Configuration',
    handler: async (_req: any, res: any, runtime) => {
      try {
        const config = {
          solanaAddress: runtime.getSetting('SOLANA_PUBLIC_KEY'),
          ethereumAddress: runtime.getSetting('ETHEREUM_PUBLIC_KEY') || runtime.getSetting('ETH_PUBLIC_KEY') || runtime.getSetting('EVM_PUBLIC_KEY'),
          hasSolanaKeys: !!(runtime.getSetting('SOLANA_PRIVATE_KEY') && runtime.getSetting('SOLANA_PUBLIC_KEY')),
          hasEthereumKeys: !!(runtime.getSetting('ETHEREUM_PRIVATE_KEY') || runtime.getSetting('ETH_PRIVATE_KEY') || runtime.getSetting('EVM_PRIVATE_KEY')),
          hasEvmProvider: !!runtime.getSetting('EVM_PROVIDER_URL'),
          hasBirdeyeApi: !!runtime.getSetting('BIRDEYE_API_KEY')
        };

        return res.json(config);
      } catch (error) {
        console.error('Error fetching config:', error);
        return res.status(500).json({ error: 'Failed to fetch configuration' });
      }
    },
  },
  {
    type: 'GET',
    path: '/portfolio',
    public: true,
    name: 'Portfolio Data',
    handler: async (_req: any, res: any, runtime) => {
      try {
        // Get environment variables from runtime
        const solanaAddress = runtime.getSetting('SOLANA_PUBLIC_KEY');
        const birdeyeApiKey = runtime.getSetting('BIRDEYE_API_KEY');
        
        if (!solanaAddress) {
          return res.status(400).json({ 
            error: 'SOLANA_PUBLIC_KEY not configured in environment variables' 
          });
        }
        
        if (!birdeyeApiKey) {
          return res.status(400).json({ 
            error: 'BIRDEYE_API_KEY not configured in environment variables' 
          });
        }
        
        // Fetch portfolio data from BirdEye API
        const portfolioUrl = `https://public-api.birdeye.so/v1/wallet/token_list?wallet=${solanaAddress}`;
        const portfolioResponse = await fetch(portfolioUrl, {
          headers: {
            'X-API-KEY': birdeyeApiKey
          }
        });
        
        if (!portfolioResponse.ok) {
          throw new Error(`BirdEye API error: ${portfolioResponse.status} ${portfolioResponse.statusText}`);
        }
        
        const portfolioData = await portfolioResponse.json();
        
        // Transform the data to match our frontend structure
        const tokens = portfolioData.data?.items?.map((item: any) => ({
          symbol: item.symbol || 'Unknown',
          balance: parseFloat(item.uiAmount || '0'),
          valueUsd: parseFloat(item.valueUsd || '0'),
          name: item.name || item.symbol || 'Unknown Token'
        })) || [];
        
        // Calculate totals
        const totalUsd = tokens.reduce((sum: number, token: any) => sum + token.valueUsd, 0);
        const solBalance = tokens.find((t: any) => t.symbol === 'SOL')?.balance || 0;
        
        const result = {
          solana: {
            address: solanaAddress,
            balance: solBalance,
            totalUsd: totalUsd,
            tokens: tokens.filter((token: any) => token.valueUsd > 0.01) // Filter out dust
          },
          ethereum: {
            address: runtime.getSetting('ETHEREUM_PUBLIC_KEY') || null,
            balance: 0,
            totalUsd: 0,
            tokens: []
          }
        };
        
        return res.json(result);
        
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch portfolio data',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  },
  {
    type: 'POST',
    path: '/trending',
    public: true,
    name: 'Trending Tokens',
    handler: async (_req: any, res: any, runtime) => {
      try {
        const cachedTrending = await runtime.getCache('trending_tokens');
        const trending = cachedTrending ? cachedTrending : [];
        // Ensure we return an array for frontend
        const trendingArray = Array.isArray(trending) ? trending : [];
        res.json(trendingArray);
      } catch (_error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  },
  {
    type: 'GET',
    path: '/tweets',
    public: true,
    name: 'Tweets Data',
    handler: async (_req: any, res: any, runtime) => {
      try {
        const cachedTweets = await runtime.getCache('tweets');
        const tweets = cachedTweets ? cachedTweets : [];
        // Ensure we return an array for frontend
        const tweetsArray = Array.isArray(tweets) ? tweets : [];
        res.json(tweetsArray);
      } catch (_error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  },
  {
    type: 'GET',
    path: '/sentiment',
    public: true,
    name: 'Sentiment Analysis',
    handler: async (_req: any, res: any, runtime) => {
      try {
        const cachedSentiment = await runtime.getCache<Sentiment[]>('sentiment');
        const sentiment = cachedSentiment ? cachedSentiment : [];
        // Ensure we return an array for frontend
        const sentimentArray = Array.isArray(sentiment) ? sentiment : [];
        res.json(sentimentArray);
      } catch (_error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  },
  {
    type: 'POST',
    path: '/statistics',
    public: true,
    name: 'Trading Statistics',
    handler: async (_req: any, res: any, runtime) => {
      try {
        const stats = {
          tweets: 0,
          sentiment: 0,
          tokens: 0
        };

        // Get data from caches
        const tweetsData = await runtime.getCache('tweets') as any[];
        const sentimentData = await runtime.getCache('sentiment') as any[];
        const trendingData = await runtime.getCache('trending_coins') as any[];

        if (tweetsData && Array.isArray(tweetsData)) {
          stats.tweets = tweetsData.length;
        }

        if (sentimentData && Array.isArray(sentimentData)) {
          const avgSentiment = sentimentData.reduce((sum: number, item: any) => sum + (item.score || 0), 0) / sentimentData.length;
          stats.sentiment = Math.round(avgSentiment * 100);
        }

        if (trendingData && Array.isArray(trendingData)) {
          stats.tokens = trendingData.length;
        }

        return res.json(stats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }
    },
  },
];

export default routes;
