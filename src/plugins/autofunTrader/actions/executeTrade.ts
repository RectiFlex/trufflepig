import type { Action, IAgentRuntime, Memory, State } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { DegenTradingService } from '../tradingService';
import { ServiceTypes } from '../types';

interface TradeParams {
  tokenAddress: string;
  amount: number;
  action: 'BUY' | 'SELL';
  slippage?: number;
}

export const executeTradeAction: Action = {
  name: 'EXECUTE_AUTOFUN_TRADE',
  description: 'Execute a buy or sell trade for a specified token using Autofun',
  examples: [
    [
      {
        name: 'User',
        content: {
          text: 'Buy 0.1 SOL worth of token at address So11111111111111111111111111111111111111112',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'I will execute a buy order for 0.1 SOL worth of tokens.',
          actions: ['EXECUTE_AUTOFUN_TRADE'],
        },
      },
    ],
    [
      {
        name: 'User',
        content: {
          text: 'Sell 1000 tokens of my position',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'I will execute a sell order for 1000 tokens.',
          actions: ['EXECUTE_AUTOFUN_TRADE'],
        },
      },
    ],
  ],
  similes: [
    'BUY_TOKEN',
    'SELL_TOKEN',
    'SWAP_TOKEN',
    'TRADE_TOKEN',
    'EXECUTE_ORDER',
    'PLACE_ORDER',
    'BUY',
    'SELL',
    'SWAP',
    'TRADE',
  ],
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    // Check if trading service is available
    const tradingService = runtime.getService(ServiceTypes.AUTOFUN_TRADING);
    console.log('🔍 Autofun trading service check:', !!tradingService);
    
    if (!tradingService) {
      console.log('❌ No autofun trading service found');
      return false;
    }

    const text = message.content.text.toLowerCase();
    console.log('🔍 Autofun validating text:', text);
    
    // Check for trading keywords
    const tradeKeywords = ['buy', 'sell', 'swap', 'trade', 'execute'];
    const hasTradeKeyword = tradeKeywords.some(keyword => text.includes(keyword));
    console.log('🔍 Autofun has trade keyword:', hasTradeKeyword);
    
    // Check for token-related keywords
    const tokenKeywords = ['token', 'sol', 'address', 'contract', 'bonk', 'pepe', 'wif'];
    const hasTokenKeyword = tokenKeywords.some(keyword => text.includes(keyword));
    console.log('🔍 Autofun has token keyword:', hasTokenKeyword);
    
    // Check for amount indicators
    const amountPattern = /\d+\.?\d*\s*(sol|tokens?|usd)/i;
    const hasAmount = amountPattern.test(text);
    console.log('🔍 Autofun has amount:', hasAmount);

    const shouldValidate = hasTradeKeyword && (hasTokenKeyword || hasAmount);
    console.log('🔍 Autofun final validation result:', shouldValidate);
    
    return shouldValidate;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: any
  ) => {
    try {
      const tradingService = runtime.getService(ServiceTypes.AUTOFUN_TRADING) as DegenTradingService;
      if (!tradingService) {
        throw new Error('Autofun trading service not available');
      }

      const text = message.content.text.toLowerCase();
      
      // Extract trading parameters from the message
      const params = extractTradeParams(text);
      
      if (!params.tokenAddress || !params.amount || !params.action) {
        const responseMemory: Memory = {
          id: runtime.agentId,
          content: {
            text: "I need more information to execute the trade. Please specify:\n- Token address or symbol\n- Amount (in SOL for buys, or token amount for sells)\n- Action (buy or sell)\n\nExample: 'Buy 0.1 SOL worth of tokens'",
            inReplyTo: message.id,
          },
          entityId: message.entityId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          createdAt: Date.now(),
        };
        
        if (callback) {
          callback(responseMemory);
        }
        return;
      }

      // Validate wallet has sufficient balance
      const walletService = (tradingService as any).walletService;
      const balance = await walletService.getBalance();
      
      if (params.action === 'BUY' && balance < params.amount) {
        const responseMemory: Memory = {
          id: runtime.agentId,
          content: {
            text: `Insufficient SOL balance. You have ${balance.toFixed(4)} SOL but tried to buy with ${params.amount} SOL.`,
            inReplyTo: message.id,
          },
          entityId: message.entityId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          createdAt: Date.now(),
        };
        
        if (callback) {
          callback(responseMemory);
        }
        return;
      }

      // Execute the trade
      const wallet = await walletService.getWallet();
      let result;
      
      if (params.action === 'BUY') {
        result = await wallet.buy({
          tokenAddress: params.tokenAddress,
          amountInSol: params.amount,
          slippageBps: (params.slippage || 5) * 100, // Convert to basis points
        });
      } else {
        result = await wallet.sell({
          tokenAddress: params.tokenAddress,
          tokenAmount: params.amount,
          slippageBps: (params.slippage || 5) * 100, // Convert to basis points
        });
      }

      let responseText: string;
      
      if (result.success) {
        responseText = `✅ Autofun trade executed successfully!\n\n` +
          `Action: ${params.action}\n` +
          `Amount: ${params.amount} ${params.action === 'BUY' ? 'SOL' : 'tokens'}\n` +
          `Transaction: https://solscan.io/tx/${result.signature}\n\n` +
          `The trade has been confirmed on the blockchain.`;
      } else {
        responseText = `❌ Trade failed: ${result.error}\n\n` +
          `Please check your balance and try again.`;
      }

      const responseMemory: Memory = {
        id: runtime.agentId,
        content: {
          text: responseText,
          inReplyTo: message.id,
        },
        entityId: message.entityId,
        agentId: runtime.agentId,
        roomId: message.roomId,
        createdAt: Date.now(),
      };
      
      if (callback) {
        callback(responseMemory);
      }

    } catch (error) {
      logger.error('Execute autofun trade action failed:', error);
      
      const errorMemory: Memory = {
        id: runtime.agentId,
        content: {
          text: `Sorry, I couldn't execute the trade. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          inReplyTo: message.id,
        },
        entityId: message.entityId,
        agentId: runtime.agentId,
        roomId: message.roomId,
        createdAt: Date.now(),
      };
      
      if (callback) {
        callback(errorMemory);
      }
    }
  },
};

function extractTradeParams(text: string): Partial<TradeParams> {
  const params: Partial<TradeParams> = {};
  
  // Extract action (buy/sell)
  if (/\b(buy|purchase)\b/i.test(text)) {
    params.action = 'BUY';
  } else if (/\b(sell|dispose)\b/i.test(text)) {
    params.action = 'SELL';
  }
  
  // Extract amount
  const amountMatch = text.match(/(\d+\.?\d*)\s*(sol|tokens?)/i);
  if (amountMatch) {
    params.amount = parseFloat(amountMatch[1]);
  }
  
  // Extract token address (44-character base58 string)
  const addressMatch = text.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/);
  if (addressMatch) {
    params.tokenAddress = addressMatch[1];
  }
  
  // Extract slippage if specified
  const slippageMatch = text.match(/(\d+\.?\d*)%?\s*slippage/i);
  if (slippageMatch) {
    params.slippage = parseFloat(slippageMatch[1]);
  }
  
  return params;
} 