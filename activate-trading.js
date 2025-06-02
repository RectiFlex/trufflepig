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
🚀 To enable trading capabilities in Eliza:

1. The trading actions have been created in:
   - src/plugins/degenTrader/actions/executeTrade.ts
   - src/plugins/autofunTrader/actions/executeTrade.ts

2. Private keys are configured:
   - SOLANA_PRIVATE_KEY: ✅ Set
   - ETHEREUM_PRIVATE_KEY: ✅ Set
   - WALLET_PRIVATE_KEY: ✅ Set

3. To test trading, go to the frontend at:
   http://localhost:5173/degen-intel/

4. And send messages like:
   - "Buy 0.01 SOL worth of BONK"
   - "Show me my portfolio"
   - "What's the price of SOL?"

⚠️ IMPORTANT: Restart Eliza to load the new trading actions:
   pkill -f elizaos && NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
`); 