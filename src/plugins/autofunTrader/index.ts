import { logger, type Plugin, type IAgentRuntime } from '@elizaos/core';
import { executeTradeAction } from './actions/executeTrade';
import { DegenTradingService } from './tradingService';
import { ServiceTypes } from './types';
import { WalletService } from './services/walletService';

export const autofunTraderPlugin: Plugin = {
  name: 'Autofun Trader Plugin',
  description: 'Autonomous trading agent plugin for automated trading strategies',
  evaluators: [],
  providers: [],
  actions: [executeTradeAction],
  services: [DegenTradingService],
  init: async (_, runtime: IAgentRuntime) => {
    // ✅ SECURITY OVERRIDES FOR WALLET ACCESS
    logger.info('🔓 Setting security overrides for trading operations...');
    
    // Set security mode to trading
    runtime.setSetting('SECURITY_MODE', 'trading');
    runtime.setSetting('WALLET_ACCESS_ENABLED', 'true');
    runtime.setSetting('ALLOW_WALLET_OPERATIONS', 'true');
    runtime.setSetting('ALLOW_TRANSACTION_SIGNING', 'true'); 
    runtime.setSetting('WALLET_TRADING_ENABLED', 'true');
    runtime.setSetting('SECURITY_OVERRIDE_TRADING', 'true');
    
    // ✅ INITIALIZE WALLET SERVICE
    logger.info('🔧 Initializing wallet service...');
    try {
      const walletService = new WalletService(runtime);
      await walletService.initialize();
      
      // Log success
      const wallet = await walletService.getWallet();
      logger.info('✅ Wallet service initialized successfully');
      logger.info(`💰 Wallet Address: ${wallet.publicKey.toString()}`);
      
      // Get balance
      const balance = await walletService.getBalance();
      logger.info(`💎 SOL Balance: ${balance} SOL`);
      logger.info('🎯 Ready to accept trading requests');
      
    } catch (error) {
      logger.error('❌ Failed to initialize wallet service:', error);
    }

    const worldId = runtime.agentId; // this is global data for the agent

    // first, get all tasks with tags "queue", "repeat", "autofun_trader" and delete them
    const tasks = await runtime.getTasks({
      tags: ['queue', 'repeat', 'autofun_trader'],
    });
    for (const task of tasks) {
      await runtime.deleteTask(task.id);
    }

    const allowBuy = true;
    const allowSell = true;

    if (allowBuy) {
      runtime.registerTaskWorker({
        name: 'AFTRADER_GOTO_MARKET',
        validate: async (runtime, _message, _state) => {
          // Check if we have some sentiment data before proceeding
          //const sentimentsData = (await runtime.getCache<Sentiment[]>('sentiments')) || [];
          //if (sentimentsData.length === 0) {
          //return false;
          //}
          return true;
        },
        execute: async (runtime, _options, task) => {
          const tradeService = runtime.getService(ServiceTypes.AUTOFUN_TRADING) as DegenTradingService;
          try {
            tradeService.buyService.generateSignal();
          } catch (error) {
            logger.error('Failed to generate buy signal', error);
            // Log the error but don't delete the task
          }
        },
      });

      runtime.createTask({
        name: 'AFTRADER_GOTO_MARKET',
        description: 'Generate a buy signal',
        worldId,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          updateInterval: 1000 * 60 * 5, // 5 minutes
        },
        tags: ['queue', 'repeat', 'autofun_trader', 'immediate'],
      });
    }

    if (allowSell) {
      runtime.registerTaskWorker({
        name: 'AFTRADER_CHECK_POSITIONS',
        validate: async (runtime, _message, _state) => {
          // Check if we have some sentiment data before proceeding
          //const sentimentsData = (await runtime.getCache<Sentiment[]>('sentiments')) || [];
          //if (sentimentsData.length === 0) {
          //return false;
          //}
          return true;
        },
        execute: async (runtime, _options, task) => {
          const tradeService = runtime.getService(ServiceTypes.AUTOFUN_TRADING) as DegenTradingService;
          try {
            tradeService.sellService.generateSignal();
          } catch (error) {
            logger.error('Failed to generate sell signal', error);
            // Log the error but don't delete the task
          }
        },
      });

      runtime.createTask({
        name: 'AFTRADER_CHECK_POSITIONS',
        description: 'Generate a sell signal',
        worldId,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          updateInterval: 1000 * 60 * 5, // 5 minutes
        },
        tags: ['queue', 'repeat', 'autofun_trader', 'immediate'],
      });
    }
  },
};

export default autofunTraderPlugin;
