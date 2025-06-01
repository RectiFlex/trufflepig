import type { IAgentRuntime, Plugin } from '@elizaos/core';
import routes from './apis';
import { registerTasks } from './tasks';
import { logger } from '@elizaos/core';
import express from 'express';
import cors from 'cors';

import { sentimentProvider } from './providers/sentiment';
import { cmcMarketProvider } from './providers/cmcMarket';
import { birdeyeTrendingProvider } from './providers/birdeyeTrending';
import { birdeyeWalletProvider } from './providers/birdeyeWallet';
// INTEL_SYNC_WALLET provider? or solana handles this?

// Custom server for mounting routes that ElizaOS doesn't mount
let customServer: any = null;

function startCustomServer(runtime: IAgentRuntime, port: number = 3001) {
  if (customServer) {
    logger.info('Custom server already running');
    return;
  }

  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Mount DegenIntel plugin routes
  logger.info(`🔌 Mounting DegenIntel plugin routes...`);
  routes.forEach(route => {
    const method = route.type.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
    logger.info(`  📍 ${route.type} ${route.path} (public: ${route.public})`);
    
    app[method](route.path, async (req, res) => {
      try {
        await route.handler(req, res, runtime);
      } catch (error) {
        logger.error(`Error in route ${route.path}:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Custom plugin routes server is running',
      timestamp: new Date().toISOString(),
      routes: routes.map(r => `${r.type} ${r.path}`)
    });
  });
  
  // Start server
  customServer = app.listen(port, () => {
    logger.info(`🚀 Custom plugin routes server listening on port ${port}`);
    logger.info(`📊 Health check: http://localhost:${port}/health`);
    logger.info(`🧪 Test endpoint: http://localhost:${port}/degenintel-test`);
  });
}

// create a new plugin
export const degenIntelPlugin: Plugin = {
  name: 'degen-intel',
  description: 'Degen Intel plugin',
  routes,
  providers: [],
  tests: [
    {
      name: 'test suite for degen-intel',
      tests: [
        {
          name: 'test for degen-intel',
          fn: async (runtime: IAgentRuntime) => {
            logger.info('test in degen-intel working');
          },
        },
      ],
    },
  ],
  // FIXME: make a service
  services: [],
  init: async (_, runtime: IAgentRuntime) => {
    // Log plugin initialization
    logger.info(`🔌 Initializing Degen Intel plugin with ${routes.length} routes`);
    routes.forEach(route => {
      logger.info(`  📍 Route: ${route.type} ${route.path} (public: ${route.public})`);
    });

    // Start custom server for plugin routes
    try {
      logger.info('🚀 Starting custom plugin routes server...');
      startCustomServer(runtime, 3001);
      logger.info('✅ Custom plugin routes server started successfully');
    } catch (error) {
      logger.error('❌ Failed to start custom plugin routes server:', error);
    }

    await registerTasks(runtime);

    const plugins = runtime.plugins.map((p) => p.name);
    let notUsed = true;

    // check for cmc key, if have then register provider
    if (runtime.getSetting('COINMARKETCAP_API_KEY')) {
      runtime.registerProvider(cmcMarketProvider);
      notUsed = false;
    }

    // check for birdeeye key, if have then register provider
    if (runtime.getSetting('BIRDEYE_API_KEY')) {
      runtime.registerProvider(birdeyeTrendingProvider);
      runtime.registerProvider(birdeyeWalletProvider);
      notUsed = false;
    }

    // twitter for sentiment
    if (plugins.indexOf('twitter') !== -1) {
      runtime.registerProvider(sentimentProvider);
      notUsed = false;
    }

    if (notUsed) {
      logger.warn(
        'degen-intel plugin is included but not providing any value (COINMARKETCAP_API_KEY/BIRDEYE_API_KEY or twitter are suggested)'
      );
    }

    logger.info('✅ Degen Intel plugin initialization complete');
  },
};
