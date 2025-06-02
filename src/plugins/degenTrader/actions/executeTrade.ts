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
  name: 'EXECUTE_TRADE',
  description: 'Execute a buy or sell trade for a specified token',
  examples: [
    [
      {
        name: 'User',
        content: {
          text: 'Buy 0.1 SOL worth of BONK token at address So11111111111111111111111111111111111111112',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'I will execute a buy order for 0.1 SOL worth of BONK.',
          actions: ['EXECUTE_TRADE'],
        },
      },
    ],
    [
      {
        name: 'User',
        content: {
          text: 'Sell all my PEPE tokens',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'I will execute a sell order for your PEPE tokens.',
          actions: ['EXECUTE_TRADE'],
        },
      },
    ],
    [
      {
        name: 'User',
        content: {
          text: 'Execute a trade: buy 1000 tokens of address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'Executing buy order for 1000 tokens.',
          actions: ['EXECUTE_TRADE'],
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
    const tradingService = runtime.getService(ServiceTypes.DEGEN_TRADING);
    console.log('🔍 Trading service check:', !!tradingService);
    
    if (!tradingService) {
      console.log('❌ No trading service found');
      return false;
    }

    const text = message.content.text.toLowerCase();
    console.log('🔍 Validating text:', text);
    
    // Check for trading keywords
    const tradeKeywords = ['buy', 'sell', 'swap', 'trade', 'execute'];
    const hasTradeKeyword = tradeKeywords.some(keyword => text.includes(keyword));
    console.log('🔍 Has trade keyword:', hasTradeKeyword);
    
    // Check for token-related keywords
    const tokenKeywords = ['token', 'sol', 'address', 'contract', 'bonk', 'pepe', 'wif'];
    const hasTokenKeyword = tokenKeywords.some(keyword => text.includes(keyword));
    console.log('🔍 Has token keyword:', hasTokenKeyword);
    
    // Check for amount indicators
    const amountPattern = /\d+\.?\d*\s*(sol|tokens?|usd)/i;
    const hasAmount = amountPattern.test(text);
    console.log('🔍 Has amount:', hasAmount);

    const shouldValidate = hasTradeKeyword && (hasTokenKeyword || hasAmount);
    console.log('🔍 Final validation result:', shouldValidate);
    
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
      const tradingService = runtime.getService(ServiceTypes.DEGEN_TRADING) as DegenTradingService;
      if (!tradingService) {
        throw new Error('Trading service not available');
      }

      const text = message.content.text.toLowerCase();
      
      // Extract trading parameters from the message
      const params = extractTradeParams(text);
      
      if (!params.tokenAddress || !params.amount || !params.action) {
        const responseMemory: Memory = {
          id: runtime.agentId,
          content: {
            text: "I need more information to execute the trade. Please specify:\n- Token address or symbol\n- Amount (in SOL for buys, or token amount for sells)\n- Action (buy or sell)\n\nExample: 'Buy 0.1 SOL worth of BONK'",
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
        responseText = `✅ Trade executed successfully!\n\n` +
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
      logger.error('Execute trade action failed:', error);
      
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
  
  // Extract token address (44-character base58 string) or symbol
  const addressMatch = text.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/);
  if (addressMatch) {
    params.tokenAddress = addressMatch[1];
  } else {
    // Look for common token symbols
    const symbolMatch = text.match(/\b(bonk|pepe|wif|popcat|pnut|brett|mog|mew|cat|dog|doge|ray|jup|pyth|orca|serum|ftt|usdc|usdt)\b/i);
    if (symbolMatch) {
      const symbol = symbolMatch[1].toUpperCase();
      // Map common symbols to their addresses
      const tokenAddresses = {
        'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        'PEPE': 'BfcfDjoVv8zzP4bgfLuJJTCy1CG3Bhwj8RU5c8s6Fx5v',
        'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        'POPCAT': '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
        'PNUT': '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump',
        'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        'PYTH': 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        'ORCA': 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
        'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'SOL': 'So11111111111111111111111111111111111111112'
      };
      if (tokenAddresses[symbol]) {
        params.tokenAddress = tokenAddresses[symbol];
      }
    }
  }
  
  // Extract slippage if specified
  const slippageMatch = text.match(/(\d+\.?\d*)%?\s*slippage/i);
  if (slippageMatch) {
    params.slippage = parseFloat(slippageMatch[1]);
  }
  
  return params;
} 