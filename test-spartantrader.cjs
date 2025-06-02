const axios = require('axios');

async function testSpartanTrader() {
  const testMessages = [
    'What is your wallet address?',
    'Show me your SOL balance',
    'Are you able to execute trades?',
    'What are your trading capabilities?'
  ];

  console.log('🔥 Testing SpartanTrader Agent...\n');

  // Try different endpoint formats
  const endpoints = [
    'http://localhost:3000/b850bc30-45f8-0041-a00a-83df46d8555d/message',
    'http://localhost:3000/spartantrader/message',
    'http://localhost:3000/api/b850bc30-45f8-0041-a00a-83df46d8555d/message',
    'http://localhost:3000/api/spartantrader/message'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔗 Testing endpoint: ${endpoint}`);
    
    try {
      const response = await axios.post(endpoint, {
        text: testMessages[0], // Just test the first message
        userId: 'test-user',
        userName: 'TestUser'
      });

      if (response.data && response.data.length > 0) {
        console.log(`✅ Success! Response: ${response.data[0].text}`);
        
        // If this endpoint works, test all messages
        console.log('\n📋 Testing all messages with working endpoint...\n');
        
        for (const message of testMessages) {
          try {
            console.log(`📤 User: ${message}`);
            
            const messageResponse = await axios.post(endpoint, {
              text: message,
              userId: 'test-user',
              userName: 'TestUser'
            });

            if (messageResponse.data && messageResponse.data.length > 0) {
              console.log(`🤖 SpartanTrader: ${messageResponse.data[0].text}`);
            } else {
              console.log('❌ No response received');
            }
            
            console.log('─'.repeat(80));
            
            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.log(`❌ Message Error: ${error.message}`);
          }
        }
        
        return; // Exit if we found a working endpoint
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Error ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`);
      } else {
        console.log(`❌ Network Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n❌ No working endpoints found for SpartanTrader');
}

testSpartanTrader().catch(console.error); 