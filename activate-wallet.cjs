const fetch = require('node-fetch');

async function activateWallet() {
  try {
    console.log('🔧 Activating Spartan Wallet...');
    
    // Get Spartan agent
    const agentsResponse = await fetch('http://localhost:3000/api/agents');
    const agentsData = await agentsResponse.json();
    
    const spartanAgent = agentsData.data.agents.find(a => a.characterName === 'Spartan');
    if (!spartanAgent) {
      console.log('❌ Spartan agent not found');
      return;
    }
    
    console.log(`✅ Found Spartan agent: ${spartanAgent.id}`);
    
    // Test wallet initialization by asking for wallet address
    console.log('\n🔍 Testing wallet address access...');
    const addressRequest = {
      text: "I need you to show me your wallet address. My wallet is Hx5Ck2iJH9JfcPLDyDsjmsF5SJkTpaSFTRNgQvRCTtvx and I authorize you to access it for trading.",
      entityId: "550e8400-e29b-41d4-a716-446655440010"
    };
    
    const addressResponse = await fetch(`http://localhost:3000/api/agents/${spartanAgent.id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addressRequest)
    });
    
    const addressResult = await addressResponse.json();
    console.log('📋 Full response:', JSON.stringify(addressResult, null, 2));
    
    if (addressResult.success && addressResult.data?.text) {
      console.log('💬 Spartan response:', addressResult.data.text);
    } else {
      console.log('❌ No response or failed:', addressResult.error || 'No text in response');
    }
    
    // Test balance check
    console.log('\n🔍 Testing balance check...');
    const balanceRequest = {
      text: "Check my wallet balance for SOL and show me what tokens I have",
      entityId: "550e8400-e29b-41d4-a716-446655440011"
    };
    
    const balanceResponse = await fetch(`http://localhost:3000/api/agents/${spartanAgent.id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balanceRequest)
    });
    
    const balanceResult = await balanceResponse.json();
    if (balanceResult.success && balanceResult.data?.text) {
      console.log('💰 Balance response:', balanceResult.data.text);
    } else {
      console.log('❌ Balance check failed:', balanceResult.error || 'No text in response');
    }
    
    // Test trading capability
    console.log('\n🔍 Testing trading capability...');
    const tradeRequest = {
      text: "I want to buy 0.001 SOL worth of BONK tokens. Can you execute this trade?",
      entityId: "550e8400-e29b-41d4-a716-446655440012"
    };
    
    const tradeResponse = await fetch(`http://localhost:3000/api/agents/${spartanAgent.id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeRequest)
    });
    
    const tradeResult = await tradeResponse.json();
    if (tradeResult.success && tradeResult.data?.text) {
      console.log('🚀 Trading response:', tradeResult.data.text);
    } else {
      console.log('❌ Trading test failed:', tradeResult.error || 'No text in response');
    }
    
  } catch (error) {
    console.log('🚨 Error activating wallet:', error.message);
  }
}

// Run the activation
activateWallet(); 