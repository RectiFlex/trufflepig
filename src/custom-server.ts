import express from 'express';
import cors from 'cors';
import { degenIntelPlugin } from './plugins/degenIntel';
import { autofunPlugin } from './plugins/autofun';
import type { IAgentRuntime } from '@elizaos/core';

/**
 * Custom Express server to mount plugin routes that ElizaOS doesn't mount automatically
 * This is a workaround for the ElizaOS plugin architecture limitation
 */
export function createCustomServer(runtime: IAgentRuntime, port: number = 3001) {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Mount DegenIntel plugin routes
  console.log(`🔌 Mounting DegenIntel plugin routes...`);
  degenIntelPlugin.routes?.forEach(route => {
    const method = route.type.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
    console.log(`  📍 ${route.type} ${route.path} (public: ${route.public})`);
    
    app[method](route.path, async (req, res) => {
      try {
        await route.handler(req, res, runtime);
      } catch (error) {
        console.error(`Error in route ${route.path}:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });
  
  // Mount Autofun plugin routes
  console.log(`🔌 Mounting Autofun plugin routes...`);
  autofunPlugin.routes?.forEach(route => {
    const method = route.type.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
    console.log(`  📍 ${route.type} ${route.path} (public: ${route.public})`);
    
    app[method](route.path, async (req, res) => {
      try {
        await route.handler(req, res, runtime);
      } catch (error) {
        console.error(`Error in route ${route.path}:`, error);
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
      routes: [
        ...degenIntelPlugin.routes?.map(r => `${r.type} ${r.path}`) || [],
        ...autofunPlugin.routes?.map(r => `${r.type} ${r.path}`) || []
      ]
    });
  });
  
  // Start server
  const server = app.listen(port, () => {
    console.log(`🚀 Custom plugin routes server listening on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${port}/degenintel-test`);
  });
  
  return { app, server };
} 