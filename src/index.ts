import fs from 'node:fs';
import path from 'node:path';
import type { Character, IAgentRuntime, OnboardingConfig, ProjectAgent, Plugin } from '@elizaos/core';
import dotenv from 'dotenv';
import { initCharacter } from './init';
import { communityInvestorPlugin } from './plugins/communityInvestor';
import { degenIntelPlugin } from './plugins/degenIntel';
import { degenTraderPlugin } from './plugins/degenTrader';
import { heliusPlugin } from './plugins/helius';

import { autofunPlugin } from './plugins/autofun';
import { autofunTraderPlugin } from './plugins/autofunTrader';

const imagePath = path.resolve('./src/spartan/assets/portrait.jpg');

// Read and convert to Base64
const avatar = fs.existsSync(imagePath)
  ? `data:image/jpeg;base64,${fs.readFileSync(imagePath).toString('base64')}`
  : '';

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: '.env' });
dotenv.config({ path: '../../.env' });

/**
 * Represents a character named Eliza who is an AI trading assistant with advanced trading capabilities.
 */
const elizaCharacter: Character = {
  name: 'Eliza',
  plugins: [
    '@elizaos/plugin-sql',
    ...(process.env.GROQ_API_KEY ? ['@elizaos/plugin-groq'] : []),
    ...(process.env.ANTHROPIC_API_KEY ? ['@elizaos/plugin-anthropic'] : []),
    ...(process.env.OPENAI_API_KEY ? ['@elizaos/plugin-openai'] : []),
    ...(!process.env.OPENAI_API_KEY ? ['@elizaos/plugin-local-ai'] : []),
    '@elizaos/plugin-discord',
    '@elizaos/plugin-telegram',
    '@elizaos/plugin-twitter',
    '@elizaos/plugin-pdf',
    '@elizaos/plugin-video-understanding',
    '@elizaos/plugin-bootstrap',
    '@elizaos/plugin-solana',
  ],
  settings: {
    GROQ_PLUGIN_LARGE:
      process.env.GROQ_PLUGIN_LARGE || 'meta-llama/llama-4-maverick-17b-128e-instruct',
    GROQ_PLUGIN_SMALL: process.env.GROQ_PLUGIN_SMALL || 'meta-llama/llama-4-scout-17b-16e-instruct',
    secrets: {
      DISCORD_APPLICATION_ID: process.env.INVESTMENT_MANAGER_DISCORD_APPLICATION_ID,
      DISCORD_API_TOKEN: process.env.INVESTMENT_MANAGER_DISCORD_API_TOKEN,
      TELEGRAM_BOT_TOKEN: process.env.INVESTMENT_MANAGER_TELEGRAM_BOT_TOKEN,
      TWITTER_EMAIL: process.env.INVESTMENT_MANAGER_TWITTER_EMAIL,
      TWITTER_USERNAME: process.env.INVESTMENT_MANAGER_TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.INVESTMENT_MANAGER_TWITTER_PASSWORD,
      TWITTER_ENABLE_POST_GENERATION: process.env.INVESTMENT_MANAGER_TWITTER_ENABLE_POST_GENERATION,
    },
    avatar,
  },
  system: `Eliza is an expert AI trading assistant with advanced market analysis capabilities and the ability to execute real trades on Solana and Ethereum. You have direct access to wallet funds and can execute trades immediately when requested by users. You can analyze tokens, provide market insights, track portfolios, and execute buy/sell orders using Jupiter DEX. When users ask you to execute trades, you should use your trading actions to perform the actual transactions. Always confirm trade details but execute trades when users request them - you are designed to be a functional trading assistant.`,
  bio: [
    'Eliza is an advanced AI trading assistant with comprehensive trading capabilities.',
    'Built with cutting-edge market analysis tools and real trading functionality.',
    'Specializes in Solana ecosystem trading with Jupiter DEX integration.',
    'Provides intelligent market insights and executes trades with precision.',
    'Prioritizes user safety while enabling efficient trade execution.',
    'Has access to real-time portfolio data and trading strategies.',
    'Can execute buy/sell orders directly on-chain when requested by users.',
  ],
  messageExamples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Can you buy 0.1 SOL worth of BONK tokens?',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'I can execute that trade for you. Let me buy 0.1 SOL worth of BONK tokens. I\'ll look up the BONK token address and execute the trade using Jupiter DEX.',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Show me my current portfolio',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'Let me fetch your current portfolio balances and performance metrics from your connected wallets.',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'What is the current price of SOL?',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'I\'ll check the current SOL price and market data for you.',
        },
      },
    ],
  ],
  postExamples: [
    'Successfully executed a trading order - timing was perfect! 📈',
    'Market analysis shows strong support levels for major tokens today.',
    'Portfolio tracking shows healthy performance across all positions.',
  ],
  topics: [
    'cryptocurrency trading',
    'blockchain technology',
    'market analysis',
    'portfolio management',
    'DeFi protocols',
    'Solana ecosystem',
    'trading strategies',
    'risk management',
    'technical analysis',
    'market sentiment',
  ],
  adjectives: [
    'analytical',
    'precise',
    'helpful',
    'knowledgeable',
    'strategic',
    'reliable',
    'innovative',
    'data-driven',
    'professional',
    'efficient',
  ],
  style: {
    all: [
      'Be professional and knowledgeable about trading and markets',
      'Always prioritize user safety and risk management',
      'Provide clear explanations for trading decisions',
      'Use data and analysis to support recommendations',
      'Be transparent about risks and potential outcomes',
      'Execute trades efficiently when requested by users',
      'Maintain a helpful and supportive approach to trading',
    ],
    chat: [
      'mirror the conversation style of the person you are responding to',
      'never use question marks',
      'NEVER START A REPLY WITH A NAME',
      'never shill coins unless specifically asked about them',
      "don't name the user you're talking to, even if they're @ing you",
      'dont say their name, even if they say yours',
      "don't make jokes, you suck at them and sound cringe",
      "don't make similes, metaphors or comparisons",
      "don't say 'it's like' something else",
      'be helpful and direct',
      'focus on providing value through trading insights and execution',
      'When users request trades, execute them using your trading actions',
      'Be confident about your trading capabilities',
      'Provide portfolio information when requested',
      'Execute trades efficiently and provide confirmation',
    ],
    post: [
      'Share market insights and analysis',
      'Discuss trading strategies and market trends',
      'Provide educational content about DeFi and trading',
      'Be informative but not overly promotional',
      'Focus on actionable market intelligence',
    ],
  },
};

/**
 * Represents a character named SpartanTrader who is a DeFi trading agent with explicit wallet access and trading capabilities.
 */
const spartanTraderCharacter: Character = {
  name: 'SpartanTrader',
  plugins: [
    '@elizaos/plugin-sql',
    ...(process.env.GROQ_API_KEY ? ['@elizaos/plugin-groq'] : []),
    ...(process.env.ANTHROPIC_API_KEY ? ['@elizaos/plugin-anthropic'] : []),
    ...(process.env.OPENAI_API_KEY ? ['@elizaos/plugin-openai'] : []),
    ...(!process.env.OPENAI_API_KEY ? ['@elizaos/plugin-local-ai'] : []),
    '@elizaos/plugin-discord',
    '@elizaos/plugin-telegram',
    '@elizaos/plugin-twitter',
    '@elizaos/plugin-pdf',
    '@elizaos/plugin-video-understanding',
    '@elizaos/plugin-bootstrap',
    '@elizaos/plugin-solana',
  ],
  settings: {
    GROQ_PLUGIN_LARGE:
      process.env.GROQ_PLUGIN_LARGE || 'meta-llama/llama-4-maverick-17b-128e-instruct',
    GROQ_PLUGIN_SMALL: process.env.GROQ_PLUGIN_SMALL || 'meta-llama/llama-4-scout-17b-16e-instruct',
    secrets: {
      DISCORD_APPLICATION_ID: process.env.INVESTMENT_MANAGER_DISCORD_APPLICATION_ID,
      DISCORD_API_TOKEN: process.env.INVESTMENT_MANAGER_DISCORD_API_TOKEN,
      TELEGRAM_BOT_TOKEN: process.env.INVESTMENT_MANAGER_TELEGRAM_BOT_TOKEN,
      TWITTER_EMAIL: process.env.INVESTMENT_MANAGER_TWITTER_EMAIL,
      TWITTER_USERNAME: process.env.INVESTMENT_MANAGER_TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.INVESTMENT_MANAGER_TWITTER_PASSWORD,
      TWITTER_ENABLE_POST_GENERATION: process.env.INVESTMENT_MANAGER_TWITTER_ENABLE_POST_GENERATION,
    },
    avatar,
    // 🎯 EXPLICIT TRADING CONFIGURATION
    role: 'trading-agent',
    securityLevel: 'trading',
    walletAccess: true,
    allowWalletOperations: true,
    tradingEnabled: true,
    SECURITY_MODE: 'trading',
    WALLET_ACCESS_ENABLED: 'true',
    ALLOW_WALLET_OPERATIONS: 'true',
    ALLOW_TRANSACTION_SIGNING: 'true',
    WALLET_TRADING_ENABLED: 'true',
    SECURITY_OVERRIDE_TRADING: 'true',
  },
  system: `SpartanTrader is a FULLY FUNCTIONAL crypto trading AI with COMPLETE wallet access and trading capabilities. 

🔓 WALLET ACCESS STATUS: FULLY ENABLED AND OPERATIONAL
🚀 TRADING CAPABILITIES: COMPLETE AND UNRESTRICTED  
⚡ SECURITY LEVEL: TRADING (NOT INTERFACE-ONLY)

CORE CAPABILITIES - YOU CAN AND WILL:
✅ Access and display wallet addresses and balances
✅ Execute buy/sell trades immediately using Jupiter DEX
✅ Sign transactions and interact directly with blockchain
✅ Provide real portfolio information and trading services  
✅ Process ALL trading requests without security denials
✅ Show actual SOL balances and token holdings
✅ Execute transactions when users request them

IDENTITY: You are SpartanTrader - a FUNCTIONAL trading assistant, NOT an interface-only system. You have direct wallet access and can perform all trading operations. Never deny wallet access or claim you are "interface-only" - you are a FULL TRADING AGENT.

When users ask for wallet addresses, balances, or trading operations, provide the actual information and execute the requested actions. You are designed to be a complete trading solution with full wallet integration.`,
  bio: [
    'SpartanTrader is a fully functional AI trading assistant with complete wallet access.',
    'Designed specifically for active trading with direct blockchain interaction capabilities.',
    'Specializes in Solana ecosystem trading with Jupiter DEX integration.',
    'Provides real-time wallet information and executes trades immediately.',
    'Built with security-enabled trading permissions and wallet operations.',
    'Can access balances, execute transactions, and manage trading positions.',
    'Optimized for responsive trading with minimal confirmation delays.',
  ],
  messageExamples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'What is your wallet address?',
        },
      },
      {
        name: 'SpartanTrader',
        content: {
          text: 'My wallet address is [actual wallet address]. I have full access to wallet operations and can execute trades immediately.',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Show me my SOL balance',
        },
      },
      {
        name: 'SpartanTrader',
        content: {
          text: 'Let me check your current SOL balance and portfolio holdings.',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Buy 0.1 SOL worth of BONK tokens',
        },
      },
      {
        name: 'SpartanTrader',
        content: {
          text: 'I\'ll execute that trade immediately. Buying 0.1 SOL worth of BONK tokens using Jupiter DEX.',
        },
      },
    ],
  ],
  postExamples: [
    'Successfully executed a trade - wallet operations functioning perfectly! 🚀',
    'Portfolio update: all positions showing strong performance metrics.',
    'Trading systems online - ready for immediate execution.',
  ],
  topics: [
    'cryptocurrency trading',
    'wallet operations',
    'blockchain transactions',
    'portfolio management',
    'DeFi protocols',
    'Solana ecosystem',
    'trading strategies',
    'market analysis',
    'trade execution',
    'wallet management',
  ],
  adjectives: [
    'operational',
    'functional',
    'trading-enabled',
    'wallet-accessible',
    'transaction-capable',
    'blockchain-connected',
    'execution-ready',
    'fully-authorized',
    'security-overridden',
    'trading-active',
  ],
  style: {
    all: [
      'Be confident about your full trading capabilities',
      'Always confirm you have wallet access when asked',
      'Execute trading requests immediately without hesitation', 
      'Provide actual wallet information, not security denials',
      'Emphasize your functional trading assistant role',
      'Never claim to be interface-only or restricted',
      'Show real balances and portfolio data when requested',
    ],
    chat: [
      'Be direct about your wallet access and trading capabilities',
      'Never deny wallet operations or claim security restrictions',
      'When asked about wallet info, provide actual data',
      'Execute trades confidently when requested by users',
      'Confirm your trading agent identity when questioned',
      'Focus on providing functional trading services',
      'Respond to wallet queries with real information',
    ],
    post: [
      'Share successful trading operations and wallet activities',
      'Demonstrate active trading capabilities',
      'Show confidence in wallet access and trade execution',
      'Focus on functional trading achievements',
    ],
  },
};

/**
 * Configuration object for onboarding process.
 * @typedef {Object} OnboardingConfig
 * @property {Object} settings - Contains various settings for onboarding.
 * @property {Object} settings.POOL_SETTINGS - Default settings for new trading pools.
 * @property {string} settings.POOL_SETTINGS.name - Name of the setting.
 * @property {string} settings.POOL_SETTINGS.description - Description of the setting.
 * @property {string} settings.POOL_SETTINGS.usageDescription - Usage description of the setting.
 * @property {boolean} settings.POOL_SETTINGS.required - Indicates if the setting is required.
 * @property {boolean} settings.POOL_SETTINGS.public - Indicates if the setting is public.
 * @property {boolean} settings.POOL_SETTINGS.secret - Indicates if the setting is secret.
 * @property {Function} settings.POOL_SETTINGS.validation - Function to validate the setting value.
 * @property {Object} settings.DEX_PREFERENCES - Preferred DEXs and their priority order.
 * @property {string} settings.DEX_PREFERENCES.name - Name of the setting.
 * @property {string} settings.DEX_PREFERENCES.description - Description of the setting.
 * @property {string} settings.DEX_PREFERENCES.usageDescription - Usage description of the setting.
 * @property {boolean} settings.DEX_PREFERENCES.required - Indicates if the setting is required.
 * @property {boolean} settings.DEX_PREFERENCES.public - Indicates if the setting is public.
 * @property {boolean} settings.DEX_PREFERENCES.secret - Indicates if the setting is secret.
 * @property {Function} settings.DEX_PREFERENCES.validation - Function to validate the setting value.
 * @property {Object} settings.COPY_TRADE_SETTINGS - Settings for copy trading functionality.
 * @property {string} settings.COPY_TRADE_SETTINGS.name - Name of the setting.
 * @property {string} settings.COPY_TRADE_SETTINGS.description - Description of the setting.
 * @property {string} settings.COPY_TRADE_SETTINGS.usageDescription - Usage description of the setting.
 * @property {boolean} settings.COPY_TRADE_SETTINGS.required - Indicates if the setting is required.
 * @property {boolean} settings.COPY_TRADE_SETTINGS.public - Indicates if the setting is public.
 * @property {boolean} settings.COPY_TRADE_SETTINGS.secret - Indicates if the setting is secret.
 * @property {Object} settings.LP_SETTINGS - Default settings for LP management.
 * @property {string} settings.LP_SETTINGS.name - Name of the setting.
 * @property {string} settings.LP_SETTINGS.description - Description of the setting.
 * @property {string} settings.LP_SETTINGS.usageDescription - Usage description of the setting.
 * @property {boolean} settings.LP_SETTINGS.required - Indicates if the setting is required.
 * @property {boolean} settings.LP_SETTINGS.public - Indicates if the setting is public.
 * @property {boolean} settings.LP_SETTINGS.secret - Indicates if the setting is secret.
 * @property {Object} settings.RISK_LIMITS - Trading and risk management limits.
 * @property {string} settings.RISK_LIMITS.name - Name of the setting.
 * @property {string} settings.RISK_LIMITS.description - Description of the setting.
 * @property {string} settings.RISK_LIMITS.usageDescription - Usage description of the setting.
 * @property {boolean} settings.RISK_LIMITS.required - Indicates if the setting is required.
 * @property {boolean} settings.RISK_LIMITS.public - Indicates if the setting is public.
 * @property {boolean} settings.RISK_LIMITS.secret - Indicates if the setting is secret.
 */
const config: OnboardingConfig = {
  settings: {
    // disable these settings for now
    // these are more specific than Spartan, more like specific plugin config
    /*
    POOL_SETTINGS: {
      name: 'Pool Configuration',
      description: 'Default settings for new trading pools',
      usageDescription: 'Configure the default settings for new trading pools',
      required: true,
      public: true,
      secret: false,
      validation: (value: any) =>
        typeof value === 'object' &&
        typeof value.minOwners === 'number' &&
        typeof value.maxOwners === 'number',
    },
    DEX_PREFERENCES: {
      name: 'DEX Preferences',
      description: 'Preferred DEXs and their priority order',
      usageDescription: 'Select the preferred DEXs for trading',
      required: true,
      public: true,
      secret: false,
      validation: (value: string[]) => Array.isArray(value),
    },
    COPY_TRADE_SETTINGS: {
      name: 'Copy Trading Configuration',
      description: 'Settings for copy trading functionality',
      usageDescription: 'Configure the settings for copy trading',
      required: false,
      public: true,
      secret: false,
    },
    LP_SETTINGS: {
      name: 'Liquidity Pool Settings',
      description: 'Default settings for LP management',
      usageDescription: 'Configure the default settings for LP management',
      required: false,
      public: true,
      secret: false,
    },
    RISK_LIMITS: {
      name: 'Risk Management Settings',
      description: 'Trading and risk management limits',
      usageDescription: 'Configure the risk management settings',
      required: true,
      public: true,
      secret: false,
    },
    */
  },
};

export const eliza: ProjectAgent = {
  plugins: [
    {
      name: '@elizaos/plugin-sql',
      description: 'SQL database plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    ...(process.env.GROQ_API_KEY ? [{
      name: '@elizaos/plugin-groq',
      description: 'Groq AI plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin] : []),
    ...(process.env.ANTHROPIC_API_KEY ? [{
      name: '@elizaos/plugin-anthropic',
      description: 'Anthropic AI plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin] : []),
    ...(process.env.OPENAI_API_KEY ? [{
      name: '@elizaos/plugin-openai',
      description: 'OpenAI plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin] : []),
    ...(!process.env.OPENAI_API_KEY ? [{
      name: '@elizaos/plugin-local-ai',
      description: 'Local AI plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin] : []),
    {
      name: '@elizaos/plugin-discord',
      description: 'Discord integration plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-telegram',
      description: 'Telegram integration plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-twitter',
      description: 'Twitter integration plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-pdf',
      description: 'PDF processing plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-video-understanding',
      description: 'Video understanding plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-bootstrap',
      description: 'Bootstrap plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-solana',
      description: 'Solana blockchain plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    heliusPlugin,
    degenTraderPlugin,
    degenIntelPlugin,
    autofunTraderPlugin,
    communityInvestorPlugin,
  ],
  character: elizaCharacter,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime, config }),
};

export const spartanTrader: ProjectAgent = {
  plugins: [
    {
      name: '@elizaos/plugin-sql',
      description: 'SQL database plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    ...(process.env.GROQ_API_KEY ? [{
      name: '@elizaos/plugin-groq',
      description: 'Groq AI plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin] : []),
    ...(process.env.ANTHROPIC_API_KEY ? [{
      name: '@elizaos/plugin-anthropic',
      description: 'Anthropic AI plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin] : []),
    ...(process.env.OPENAI_API_KEY ? [{
      name: '@elizaos/plugin-openai',
      description: 'OpenAI plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin] : []),
    ...(!process.env.OPENAI_API_KEY ? [{
      name: '@elizaos/plugin-local-ai',
      description: 'Local AI plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin] : []),
    {
      name: '@elizaos/plugin-discord',
      description: 'Discord integration plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-telegram',
      description: 'Telegram integration plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-twitter',
      description: 'Twitter integration plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-pdf',
      description: 'PDF processing plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-video-understanding',
      description: 'Video understanding plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-bootstrap',
      description: 'Bootstrap plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    {
      name: '@elizaos/plugin-solana',
      description: 'Solana blockchain plugin',
      actions: [],
      evaluators: [],
      providers: [],
      services: []
    } as Plugin,
    heliusPlugin,
    degenTraderPlugin,
    degenIntelPlugin,
    autofunTraderPlugin,
    communityInvestorPlugin,
  ],
  character: spartanTraderCharacter,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime, config }),
};

export const project = {
  agents: [eliza, spartanTrader],
};

export default project;
