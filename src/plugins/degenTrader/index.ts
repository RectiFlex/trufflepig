import { logger, type Plugin, type IAgentRuntime } from '@elizaos/core';
import { executeTradeAction } from './actions/executeTrade';
import { DegenTradingService } from './tradingService';
import { WalletService } from './services/walletService';

export const degenTraderPlugin: Plugin = {
  name: 'Degen Trader Plugin',
  description: 'Autonomous trading agent plugin',
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
  },
};

export default degenTraderPlugin;
