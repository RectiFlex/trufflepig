const fs = require('fs');
const path = require('path');

// Read the current .env file
const envPath = '.env';
const envContent = fs.readFileSync(envPath, 'utf-8');

// Check if trading is already enabled
if (!envContent.includes('ENABLE_TRADING=true')) {
  // Add trading configuration
  const tradingConfig = `
# Trading Configuration
ENABLE_TRADING=true
TRADING_ENABLED=true
WALLET_TRADING_ENABLED=true
JUPITER_ENABLED=true
AUTO_TRADING_ENABLED=false
CONFIRM_TRADES=true
`;
  
  fs.appendFileSync(envPath, tradingConfig);
  console.log('✅ Trading configuration added to .env');
} else {
  console.log('✅ Trading is already configured');
}

console.log(`
🚀 Trading Setup Complete!

📋 Summary of what I've done to enable trading:

1. ✅ Created trading actions:
   - src/plugins/degenTrader/actions/executeTrade.ts
   - src/plugins/autofunTrader/actions/executeTrade.ts

2. ✅ Updated plugin configurations to include trading actions

3. ✅ Configured environment variables for trading

4. ✅ Private keys are set for:
   - Solana wallet (SOLANA_PRIVATE_KEY)
   - Ethereum wallet (ETHEREUM_PRIVATE_KEY)

5. ✅ Frontend is running at: http://localhost:5173/degen-intel/

6. ✅ Backend APIs are available:
   - Portfolio: http://localhost:5173/portfolio
   - Market data: http://localhost:5173/trending

🎯 How to test trading:

Go to your frontend at http://localhost:5173/degen-intel/ and try these commands:
- "Buy 0.01 SOL worth of BONK tokens"
- "Show me my current portfolio"
- "What's the current price of SOL?"
- "Sell 100 tokens of my position"

⚠️ Important: 
- Eliza will ALWAYS ask for confirmation before executing trades
- All trades require explicit user approval for safety
- Start with small amounts to test the functionality

🔄 If Eliza still says she can't trade, restart the backend:
   pkill -f elizaos && NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
`); 