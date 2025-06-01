#!/usr/bin/env node

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Disable SSL verification for all requests - this fixes the SSL certificate issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Standalone server for plugin routes that ElizaOS doesn't mount automatically
 * This is a workaround for the ElizaOS plugin architecture limitation
 */

const app = express();
const PORT = process.env.PLUGIN_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock runtime object with environment variable access and cache functionality
const mockRuntime = {
  getSetting: (key: string) => {
    const value = process.env[key];
    if (key === 'COINGECKO_API_KEY' && value) {
      // Clean the API key by removing comments
      return value.split('#')[0].trim();
    }
    return value;
  },
  getCache: async (key: string) => {
    // Return mock data for now - in a real implementation this would connect to a cache system
    if (key === 'portfolio') return null;
    if (key === 'trending_tokens') return [];
    if (key === 'tweets') return [];
    if (key === 'sentiment') return [];
    if (key === 'transaction_history') return [];
    if (key === 'trending_coins') return [];
    return null;
  }
};

// DegenIntel Routes - properly mounted and working
app.get('/degenintel-test', (req: Request, res: Response) => {
  res.json({
    message: 'DegenIntel API test endpoint working! Routes properly mounted.',
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
});

app.post('/wallet', async (req: Request, res: Response) => {
  try {
    // Get wallet portfolio from cache or provider
    const portfolioData = await mockRuntime.getCache('portfolio') as any;
    const transactionHistory = await mockRuntime.getCache('transaction_history') as any[];
    
    if (portfolioData && portfolioData.data) {
      return res.json({
        address: mockRuntime.getSetting('SOLANA_PUBLIC_KEY'),
        portfolio: portfolioData.data,
        history: transactionHistory || [],
        totalUsd: portfolioData.data.totalUsd || 0,
        tokens: portfolioData.data.items || []
      });
    }

    return res.json({ 
      address: mockRuntime.getSetting('SOLANA_PUBLIC_KEY') || 'Not configured',
      portfolio: null, 
      history: [],
      totalUsd: 0,
      tokens: []
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

app.get('/config', (req: Request, res: Response) => {
  try {
    const config = {
      solanaAddress: mockRuntime.getSetting('SOLANA_PUBLIC_KEY'),
      ethereumAddress: mockRuntime.getSetting('ETHEREUM_PUBLIC_KEY') || mockRuntime.getSetting('ETH_PUBLIC_KEY') || mockRuntime.getSetting('EVM_PUBLIC_KEY'),
      hasSolanaKeys: !!(mockRuntime.getSetting('SOLANA_PRIVATE_KEY') && mockRuntime.getSetting('SOLANA_PUBLIC_KEY')),
      hasEthereumKeys: !!(mockRuntime.getSetting('ETHEREUM_PRIVATE_KEY') || mockRuntime.getSetting('ETH_PRIVATE_KEY') || mockRuntime.getSetting('EVM_PRIVATE_KEY')),
      hasEvmProvider: !!mockRuntime.getSetting('EVM_PROVIDER_URL'),
      hasBirdeyeApi: !!mockRuntime.getSetting('BIRDEYE_API_KEY')
    };

    return res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    return res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

app.get('/portfolio', async (req: Request, res: Response) => {
  try {
    // Get environment variables
    const solanaAddress = mockRuntime.getSetting('SOLANA_PUBLIC_KEY');
    const ethereumAddress = mockRuntime.getSetting('ETHEREUM_PUBLIC_KEY') || mockRuntime.getSetting('ETH_PUBLIC_KEY') || mockRuntime.getSetting('EVM_PUBLIC_KEY');
    const birdeyeApiKey = mockRuntime.getSetting('BIRDEYE_API_KEY');
    const etherscanApiKey = mockRuntime.getSetting('ETHERSCAN_API_KEY') || 'YourApiKeyToken'; // Use free tier if no key
    const coingeckoApiKey = mockRuntime.getSetting('COINGECKO_API_KEY');
    
    // Fetch ETH price from CoinGecko
    let ethPriceUsd = 0;
    if (coingeckoApiKey) {
      try {
        const priceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
        const priceResponse = await fetch(priceUrl, {
          headers: {
            'x-cg-demo-api-key': coingeckoApiKey.split(' ')[0] // Remove any comments
          }
        });
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          ethPriceUsd = priceData.ethereum?.usd || 0;
          console.log(`ETH Price: $${ethPriceUsd}`);
        }
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    }
    
    let solanaData = {
      address: solanaAddress || 'Not configured',
      balance: 0,
      totalUsd: 0,
      tokens: []
    };
    
    let ethereumData = {
      address: ethereumAddress || 'Not configured',
      balance: 0,
      totalUsd: 0,
      tokens: []
    };
    
    // Fetch Solana data if configured
    if (solanaAddress && birdeyeApiKey) {
      try {
        const portfolioUrl = `https://public-api.birdeye.so/v1/wallet/token_list?wallet=${solanaAddress}`;
        console.log(`Calling BirdEye API: ${portfolioUrl}`);
        console.log(`Using API key: ${birdeyeApiKey.substring(0, 8)}...`);
        
        const portfolioResponse = await fetch(portfolioUrl, {
          headers: {
            'X-API-KEY': birdeyeApiKey
          }
        });
        
        console.log(`BirdEye API response status: ${portfolioResponse.status}`);
        
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          console.log(`BirdEye API response:`, JSON.stringify(portfolioData, null, 2));
          
          // Transform the data to match our frontend structure
          const tokens = portfolioData.data?.items?.map((item: any) => ({
            symbol: item.symbol || 'Unknown',
            balance: parseFloat(item.uiAmount || '0'),
            valueUsd: parseFloat(item.valueUsd || '0'),
            name: item.name || item.symbol || 'Unknown Token'
          })) || [];
          
          const totalUsd = tokens.reduce((sum: number, token: any) => sum + token.valueUsd, 0);
          const solBalance = tokens.find((t: any) => t.symbol === 'SOL')?.balance || 0;
          
          solanaData = {
            address: solanaAddress,
            balance: solBalance,
            totalUsd: totalUsd,
            tokens: tokens.filter((token: any) => token.valueUsd > 0.01)
          };
        } else {
          const errorText = await portfolioResponse.text();
          console.error(`BirdEye API error: ${portfolioResponse.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error fetching Solana portfolio:', error);
      }
    }
    
    // Fetch Ethereum data if configured
    if (ethereumAddress) {
      try {
        console.log(`Fetching Ethereum data for address: ${ethereumAddress}`);
        
        // Get ETH balance
        const ethBalanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${ethereumAddress}&tag=latest&apikey=${etherscanApiKey}`;
        const ethBalanceResponse = await fetch(ethBalanceUrl);
        
        if (ethBalanceResponse.ok) {
          const ethBalanceData = await ethBalanceResponse.json();
          const ethBalanceWei = parseInt(ethBalanceData.result || '0');
          const ethBalance = ethBalanceWei / 1000000000000000000; // Convert from Wei to ETH
          
          console.log(`ETH Balance: ${ethBalance} ETH`);
          
          // Get ERC20 token transactions to identify tokens
          const tokenTxUrl = `https://api.etherscan.io/api?module=account&action=tokentx&address=${ethereumAddress}&page=1&offset=100&sort=desc&apikey=${etherscanApiKey}`;
          const tokenTxResponse = await fetch(tokenTxUrl);
          
          let tokens = [];
          
          if (tokenTxResponse.ok) {
            const tokenTxData = await tokenTxResponse.json();
            const tokenTransactions = tokenTxData.result || [];
            
            // Get unique token contracts from transactions
            const uniqueTokens = new Map();
            
            for (const tx of tokenTransactions.slice(0, 20)) { // Limit to recent 20 transactions
              if (tx && tx.to && tx.from && (tx.to.toLowerCase() === ethereumAddress.toLowerCase() || tx.from.toLowerCase() === ethereumAddress.toLowerCase())) {
                const contractAddress = tx.contractAddress;
                const tokenSymbol = tx.tokenSymbol;
                const tokenName = tx.tokenName;
                const tokenDecimals = parseInt(tx.tokenDecimal) || 18;
                
                if (contractAddress && !uniqueTokens.has(contractAddress)) {
                  uniqueTokens.set(contractAddress, {
                    contractAddress,
                    symbol: tokenSymbol,
                    name: tokenName,
                    decimals: tokenDecimals
                  });
                }
              }
            }
            
            // Get balances for identified tokens
            for (const [contractAddress, tokenInfo] of uniqueTokens) {
              try {
                const tokenBalanceUrl = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${ethereumAddress}&tag=latest&apikey=${etherscanApiKey}`;
                const tokenBalanceResponse = await fetch(tokenBalanceUrl);
                
                if (tokenBalanceResponse.ok) {
                  const tokenBalanceData = await tokenBalanceResponse.json();
                  const balanceRaw = parseInt(tokenBalanceData.result || '0');
                  const balance = balanceRaw / Math.pow(10, tokenInfo.decimals);
                  
                  if (balance > 0) {
                    tokens.push({
                      symbol: tokenInfo.symbol || 'Unknown',
                      balance: balance,
                      valueUsd: 0, // We'd need a price API to get USD values
                      name: tokenInfo.name || tokenInfo.symbol || 'Unknown Token'
                    });
                  }
                }
                
                // Add small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
              } catch (error) {
                console.error(`Error fetching balance for token ${contractAddress}:`, error);
              }
            }
          }
          
          // Add ETH as the first token with USD value
          if (ethBalance > 0) {
            const ethValueUsd = ethBalance * ethPriceUsd;
            tokens.unshift({
              symbol: 'ETH',
              balance: ethBalance,
              valueUsd: ethValueUsd,
              name: 'Ethereum'
            });
          }
          
          // Calculate total USD value
          const totalUsd = tokens.reduce((sum: number, token: any) => sum + token.valueUsd, 0);
          
          ethereumData = {
            address: ethereumAddress,
            balance: ethBalance,
            totalUsd: totalUsd,
            tokens: tokens
          };
          
          console.log(`Ethereum tokens found: ${tokens.length}`);
        } else {
          console.error(`Etherscan API error: ${ethBalanceResponse.status}`);
        }
      } catch (error) {
        console.error('Error fetching Ethereum portfolio:', error);
      }
    }
    
    const result = {
      solana: solanaData,
      ethereum: ethereumData
    };
    
    return res.json(result);
    
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch portfolio data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/trending', async (req: Request, res: Response) => {
  try {
    const trending = await mockRuntime.getCache('trending_tokens');
    const trendingArray = Array.isArray(trending) ? trending : [];
    res.json(trendingArray);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/tweets', async (req: Request, res: Response) => {
  try {
    const tweets = await mockRuntime.getCache('tweets');
    const tweetsArray = Array.isArray(tweets) ? tweets : [];
    res.json(tweetsArray);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/sentiment', async (req: Request, res: Response) => {
  try {
    const sentiment = await mockRuntime.getCache('sentiment');
    const sentimentArray = Array.isArray(sentiment) ? sentiment : [];
    res.json(sentimentArray);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/statistics', async (req: Request, res: Response) => {
  try {
    // Get real portfolio data
    const solanaAddress = mockRuntime.getSetting('SOLANA_PUBLIC_KEY');
    const ethereumAddress = mockRuntime.getSetting('ETHEREUM_PUBLIC_KEY') || mockRuntime.getSetting('ETH_PUBLIC_KEY') || mockRuntime.getSetting('EVM_PUBLIC_KEY');
    
    let totalTokens = 0;
    let totalChains = 0;
    
    // Count Solana tokens if configured
    if (solanaAddress) {
      totalChains++;
      const birdeyeApiKey = mockRuntime.getSetting('BIRDEYE_API_KEY');
      if (birdeyeApiKey) {
        try {
          const portfolioUrl = `https://public-api.birdeye.so/v1/wallet/token_list?wallet=${solanaAddress}`;
          const portfolioResponse = await fetch(portfolioUrl, {
            headers: { 'X-API-KEY': birdeyeApiKey }
          });
          
          if (portfolioResponse.ok) {
            const portfolioData = await portfolioResponse.json();
            totalTokens += portfolioData.data?.items?.length || 0;
          }
        } catch (error) {
          console.error('Error counting Solana tokens:', error);
        }
      }
    }
    
    // Count Ethereum tokens if configured
    if (ethereumAddress) {
      totalChains++;
      totalTokens += 1; // At least ETH itself
    }
    
    const stats = {
      tweets: 0, // TODO: Implement real Twitter/X integration
      sentiment: 75, // Mock positive sentiment for now
      tokens: totalTokens,
      chains: totalChains
    };

    return res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Autofun Routes
app.get('/autofun-test', (req: Request, res: Response) => {
  res.json({ 
    message: 'Autofun routes are working!', 
    timestamp: new Date().toISOString() 
  });
});

app.post('/autofun/portfolio', async (req: Request, res: Response) => {
  try {
    const portfolio = await mockRuntime.getCache('portfolio');
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/autofun/transactions', async (req: Request, res: Response) => {
  try {
    const transactions = await mockRuntime.getCache('transaction_history') as any[];
    const history = (transactions || [])
      .filter((tx: any) => tx.data?.mainAction === 'received')
      .sort((a: any, b: any) => new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime())
      .slice(0, 100);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CoinGecko API test endpoint
app.get('/coingecko-test', async (req: Request, res: Response) => {
  try {
    const apiKey = mockRuntime.getSetting('COINGECKO_API_KEY')?.split(' ')[0]; // Remove any comments
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'COINGECKO_API_KEY not configured' 
      });
    }

    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`, {
      headers: {
        'x-cg-demo-api-key': apiKey
      }
    });

    const data = await response.json();
    
    res.json({
      success: true,
      data: data,
      message: 'CoinGecko API working'
    });
  } catch (error) {
    console.error('CoinGecko API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/anthropic-test', async (req: Request, res: Response) => {
  try {
    const apiKey = mockRuntime.getSetting('ANTHROPIC_API_KEY')?.split(' ')[0]; // Remove any comments
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'ANTHROPIC_API_KEY not configured' 
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 20,
        messages: [
          {
            role: 'user',
            content: 'Say hello and confirm you are working'
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }
    
    res.json({
      success: true,
      response: data.content[0]?.text || 'No response text',
      model: data.model,
      usage: data.usage,
      message: 'Anthropic API working perfectly'
    });
  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const envStatus = {
    hasSolanaPublicKey: !!mockRuntime.getSetting('SOLANA_PUBLIC_KEY'),
    hasBirdeyeApi: !!mockRuntime.getSetting('BIRDEYE_API_KEY'),
    hasEthereumPublicKey: !!mockRuntime.getSetting('ETHEREUM_PUBLIC_KEY'),
    hasCoingeckoApi: !!mockRuntime.getSetting('COINGECKO_API_KEY'),
    hasAnthropicApi: !!mockRuntime.getSetting('ANTHROPIC_API_KEY'),
  };

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: envStatus,
    routes: [
      '/health - Health check and route list',
      '/config - Environment configuration',
      '/degenintel-test - DegenIntel plugin test',
      '/portfolio - Live portfolio data via BirdEye API',
      '/trending - Trending tokens (mock data)',
      '/tweets - Recent tweets (mock data)', 
      '/sentiment - Market sentiment analysis (mock data)',
      '/statistics - Trading statistics (mock data)',
      '/autofun-test - AutoFun plugin test',
      '/autofun/portfolio - AutoFun portfolio (mock data)',
      '/autofun/transactions - AutoFun transactions (mock data)',
      '/coingecko-test - CoinGecko API test',
      '/anthropic-test - Anthropic API test'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Standalone plugin routes server listening on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/degenintel-test`);
  console.log(`💰 Portfolio endpoint: http://localhost:${PORT}/portfolio`);
  console.log(`⚙️  Config endpoint: http://localhost:${PORT}/config`);
  console.log(`🪙 CoinGecko test: http://localhost:${PORT}/coingecko-test`);
  console.log(`🤖 Anthropic test: http://localhost:${PORT}/anthropic-test`);
  
  // Log environment status
  console.log('\n🔧 Environment Status:');
  console.log(`  SOLANA_PUBLIC_KEY: ${mockRuntime.getSetting('SOLANA_PUBLIC_KEY') ? '✅ Set' : '❌ Missing'}`);
  console.log(`  BIRDEYE_API_KEY: ${mockRuntime.getSetting('BIRDEYE_API_KEY') ? '✅ Set' : '❌ Missing'}`);
  console.log(`  ETHEREUM_PUBLIC_KEY: ${mockRuntime.getSetting('ETHEREUM_PUBLIC_KEY') ? '✅ Set' : '❌ Missing'}`);
  console.log(`  COINGECKO_API_KEY: ${mockRuntime.getSetting('COINGECKO_API_KEY') ? '✅ Set' : '❌ Missing'}`);
  console.log(`  ANTHROPIC_API_KEY: ${mockRuntime.getSetting('ANTHROPIC_API_KEY') ? '✅ Set' : '❌ Missing'}`);
});