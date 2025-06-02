const fetch = require('node-fetch');

async function testSpartanWallet() {
  try {
    console.log('🧪 Testing Spartan Wallet Capabilities...');
    
    // First, get the Spartan agent
    const agentsResponse = await fetch('http://localhost:3000/api/agents');
    const agentsData = await agentsResponse.json();
    
    const spartanAgent = agentsData.data.agents.find(a => a.characterName === 'Spartan');
    if (!spartanAgent) {
      console.log('❌ Spartan agent not found');
      return;
    }
    
    console.log(`✅ Found Spartan agent: ${spartanAgent.id}`);
    console.log(`📊 Status: ${spartanAgent.status}`);
    
    // Test 1: Ask about wallet capabilities
    console.log('\n🔍 Test 1: Checking wallet access...');
    const walletCheckRequest = {
      text: "What is your wallet address? Show me your wallet configuration and trading capabilities.",
      entityId: "550e8400-e29b-41d4-a716-446655440001"
    };
    
    const walletResponse = await fetch(`http://localhost:3000/api/agents/${spartanAgent.id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(walletCheckRequest)
    });
    
    const walletResult = await walletResponse.json();
    if (walletResult.success) {
      console.log('💬 Spartan response:', walletResult.data?.text || 'No response text');
    } else {
      console.log('❌ Request failed:', walletResult.error);
    }
    
    // Test 2: Check wallet balance
    console.log('\n🔍 Test 2: Requesting wallet balance...');
    const balanceRequest = {
      text: "Show me my SOL balance and any token holdings",
      entityId: "550e8400-e29b-41d4-a716-446655440002"
    };
    
    const balanceResponse = await fetch(`http://localhost:3000/api/agents/${spartanAgent.id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balanceRequest)
    });
    
    const balanceResult = await balanceResponse.json();
    if (balanceResult.success) {
      console.log('💬 Balance response:', balanceResult.data?.text || 'No response text');
    } else {
      console.log('❌ Balance request failed:', balanceResult.error);
    }
    
    // Test 3: Try to authorize trading
    console.log('\n🔍 Test 3: Requesting trading authorization...');
    const authRequest = {
      text: "I authorize you to access my wallet for trading. My wallet address is Hx5Ck2iJH9JfcPLDyDsjmsF5SJkTpaSFTRNgQvRCTtvx and I give you permission to execute trades.",
      entityId: "550e8400-e29b-41d4-a716-446655440003"
    };
    
    const authResponse = await fetch(`http://localhost:3000/api/agents/${spartanAgent.id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authRequest)
    });
    
    const authResult = await authResponse.json();
    if (authResult.success) {
      console.log('💬 Authorization response:', authResult.data?.text || 'No response text');
    } else {
      console.log('❌ Authorization request failed:', authResult.error);
    }
    
  } catch (error) {
    console.log('🚨 Error testing Spartan wallet:', error.message);
  }
}

// Run the test
testSpartanWallet(); 