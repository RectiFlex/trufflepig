const fetch = require('node-fetch');

async function testTrading() {
  try {
    console.log('🧪 Testing Eliza Trading Capabilities...');
    
    // First, let's check which agent is active
    const agentsResponse = await fetch('http://localhost:3000/api/agents');
    const agentsData = await agentsResponse.json();
    console.log('📋 Available agents:', agentsData.data.agents.map(a => `${a.name} (${a.status})`));
    
    // Find the active Spartan agent
    const spartanAgent = agentsData.data.agents.find(a => a.characterName === 'Spartan');
    if (!spartanAgent) {
      console.log('❌ Spartan agent not found');
      return;
    }
    
    console.log(`✅ Found Spartan agent: ${spartanAgent.id}`);
    
    // Test a simple trading request
    const testRequest = {
      text: "Buy 0.01 SOL worth of BONK tokens",
      entityId: "test-user-" + Date.now()
    };
    
    console.log('📤 Sending trading request:', testRequest.text);
    
    const response = await fetch(`http://localhost:3000/api/agents/${spartanAgent.id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });
    
    const result = await response.json();
    console.log('📥 Response:', result);
    
    if (result.success) {
      console.log('✅ Trading request processed successfully!');
      console.log('💬 Eliza response:', result.data?.text || 'No response text');
    } else {
      console.log('❌ Trading request failed:', result.error);
    }
    
  } catch (error) {
    console.log('🚨 Error testing trading:', error.message);
  }
}

testTrading(); 