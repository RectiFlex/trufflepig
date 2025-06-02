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

// Helper functions for enhanced agent information
function getAgentCapabilities(characterName: string): string[] {
  const capabilities: Record<string, string[]> = {
    'Eliza': ['General conversation', 'Question answering', 'Knowledge base'],
    'Spartan': ['Solana trading', 'DeFi operations', 'Pool management', 'Token analysis'],
    'Truffle': ['Trading automation', 'Market analysis', 'Portfolio management']
  };
  
  return capabilities[characterName] || ['General AI assistant'];
}

function calculateUptime(agentId: string): string {
  // Placeholder implementation - in a real system, you'd track actual uptime
  // For now, return a simulated uptime
  const now = new Date();
  const startTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000); // Random time up to 24 hours ago
  const uptimeMs = now.getTime() - startTime.getTime();
  
  const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

function getAgentPlugins(characterName: string): string[] {
  const plugins: Record<string, string[]> = {
    'Eliza': ['@elizaos/plugin-openai', '@elizaos/plugin-knowledge'],
    'Spartan': ['@elizaos/plugin-solana', '@elizaos/plugin-degentrader', '@elizaos/plugin-trading'],
    'Truffle': ['@elizaos/plugin-autofun', '@elizaos/plugin-trading', '@elizaos/plugin-analytics']
  };
  
  return plugins[characterName] || ['@elizaos/plugin-core'];
}

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
          'GET /portfolio - Get multi-chain portfolio',
          'POST /agents/:id/start - Start an agent',
          'POST /agents/:id/stop - Stop an agent',
          'GET /agents/enhanced - Get enhanced agent information'
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
  // Frontend static file serving routes
  {
    type: 'GET',
    path: '/degen-intel',
    public: true,
    name: 'Degen Intel Dashboard (Root)',
    handler: async (_req: any, res: any) => {
      console.log('=== DEGEN INTEL DASHBOARD ROOT ROUTE HIT ===');
      console.log('Request path:', _req.path);
      console.log('Request URL:', _req.url);
      const indexPath = path.resolve(process.cwd(), 'dist/index.html');
      console.log('Serving index.html from:', indexPath);
      console.log('File exists:', fs.existsSync(indexPath));
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not built. Please run: npm run build');
      }
    },
  },
  {
    type: 'GET',
    path: '/degen-intel/',
    public: true,
    name: 'Degen Intel Dashboard',
    handler: async (_req: any, res: any) => {
      console.log('=== DEGEN INTEL DASHBOARD ROUTE HIT ===');
      console.log('Request path:', _req.path);
      console.log('Request URL:', _req.url);
      const indexPath = path.resolve(process.cwd(), 'dist/index.html');
      console.log('Serving index.html from:', indexPath);
      console.log('File exists:', fs.existsSync(indexPath));
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not built. Please run: npm run build');
      }
    },
  },
  {
    type: 'GET',
    path: '/degen-intel/*',
    public: true,
    name: 'Degen Intel Dashboard Wildcard',
    handler: async (_req: any, res: any) => {
      const indexPath = path.resolve(process.cwd(), 'dist/index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not built. Please run: npm run build');
      }
    },
  },
  {
    type: 'GET',
    path: '/degen-intel/assets/:filename',
    public: true,
    name: 'Degen Intel Assets',
    handler: async (req: any, res: any) => {
      const filename = req.params.filename;
      const filePath = path.resolve(process.cwd(), 'dist', 'assets', filename);
      console.log('Asset request:', {
        filename,
        filePath,
        exists: fs.existsSync(filePath)
      });
      if (fs.existsSync(filePath)) {
        if (filename.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filename.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
        res.sendFile(filePath);
      } else {
        res.status(404).send('Asset not found');
      }
    },
  },
  // Enhanced agent information endpoint
  {
    type: 'GET',
    path: '/agents/enhanced',
    public: true,
    name: 'Enhanced Agent Information',
    handler: async (req: any, res: any, runtime: IAgentRuntime) => {
      try {
        // Get base agent information
        const agentsResponse = await fetch('http://localhost:3000/api/agents');
        const agentsData = await agentsResponse.json();
        
        if (!agentsData.success) {
          throw new Error('Failed to fetch agents from core API');
        }

        // Enhance with additional information
        const enhancedAgents = agentsData.data.agents.map((agent: any) => ({
          ...agent,
          capabilities: getAgentCapabilities(agent.characterName),
          lastSeen: new Date().toISOString(), // In a real implementation, track this
          uptime: agent.status === 'active' ? calculateUptime(agent.id) : null,
          tradingEnabled: ['Spartan', 'Truffle'].includes(agent.characterName),
          plugins: getAgentPlugins(agent.characterName)
        }));

        res.json({
          success: true,
          data: {
            agents: enhancedAgents,
            totalAgents: enhancedAgents.length,
            activeAgents: enhancedAgents.filter(a => a.status === 'active').length,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error fetching enhanced agent information:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch enhanced agent information',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  },
  // Agent start endpoint
  {
    type: 'POST',
    path: '/agents/:id/start',
    public: true,
    name: 'Start Agent',
    handler: async (req: any, res: any, runtime: IAgentRuntime) => {
      try {
        const agentId = req.params.id;
        
        // Get current agent information
        const agentsResponse = await fetch('http://localhost:3000/api/agents');
        const agentsData = await agentsResponse.json();
        
        const agent = agentsData.data?.agents?.find((a: any) => a.id === agentId);
        if (!agent) {
          return res.status(404).json({
            success: false,
            error: 'Agent not found'
          });
        }

        if (agent.status === 'active') {
          return res.json({
            success: true,
            message: `Agent ${agent.name} is already active`,
            data: { agent }
          });
        }

        // Note: ElizaOS doesn't have built-in start/stop functionality per agent
        // This is a placeholder for future implementation
        // In a real implementation, you would need to integrate with ElizaOS core
        // to actually start/stop agent runtimes
        
        // Simulate starting the agent (placeholder)
        // In reality, you'd need to:
        // 1. Load the agent configuration
        // 2. Initialize the agent runtime
        // 3. Start the agent services
        
        res.json({
          success: false,
          error: 'Agent start/stop functionality not yet implemented in ElizaOS core',
          message: 'This feature requires integration with ElizaOS core agent management',
          suggestion: 'Currently, agents are managed through the ElizaOS configuration and startup process'
        });
        
      } catch (error) {
        console.error('Error starting agent:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to start agent',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  },
  // Agent stop endpoint
  {
    type: 'POST',
    path: '/agents/:id/stop',
    public: true,
    name: 'Stop Agent',
    handler: async (req: any, res: any, runtime: IAgentRuntime) => {
      try {
        const agentId = req.params.id;
        
        // Get current agent information
        const agentsResponse = await fetch('http://localhost:3000/api/agents');
        const agentsData = await agentsResponse.json();
        
        const agent = agentsData.data?.agents?.find((a: any) => a.id === agentId);
        if (!agent) {
          return res.status(404).json({
            success: false,
            error: 'Agent not found'
          });
        }

        if (agent.status === 'inactive') {
          return res.json({
            success: true,
            message: `Agent ${agent.name} is already inactive`,
            data: { agent }
          });
        }

        // Placeholder for stop functionality
        res.json({
          success: false,
          error: 'Agent start/stop functionality not yet implemented in ElizaOS core',
          message: 'This feature requires integration with ElizaOS core agent management',
          suggestion: 'Currently, agents are managed through the ElizaOS configuration and startup process'
        });
        
      } catch (error) {
        console.error('Error stopping agent:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to stop agent',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  },
];

export default routes;
