#!/usr/bin/env node

/**
 * Test script to verify BirdEye API connectivity
 * This will help debug if the API keys and wallet address are working correctly
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SOLANA_PUBLIC_KEY = process.env.SOLANA_PUBLIC_KEY;
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;

console.log('🔍 Testing BirdEye API Integration\n');

// Check environment variables
console.log('Environment Variables:');
console.log(`SOLANA_PUBLIC_KEY: ${SOLANA_PUBLIC_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log(`BIRDEYE_API_KEY: ${BIRDEYE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log('');

if (!SOLANA_PUBLIC_KEY || !BIRDEYE_API_KEY) {
  console.log('❌ Missing required environment variables in .env file');
  process.exit(1);
}

async function testBirdEyeAPI() {
  try {
    console.log('📡 Testing BirdEye API connectivity...');
    
    // Test portfolio endpoint
    const portfolioUrl = `https://public-api.birdeye.so/v1/wallet/token_list?wallet=${SOLANA_PUBLIC_KEY}`;
    console.log(`Testing URL: ${portfolioUrl}`);
    
    const response = await fetch(portfolioUrl, {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY
      }
    });
    
    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error Response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response received successfully');
    console.log('');
    
    // Parse portfolio data
    const tokens = data.data?.items || [];
    console.log(`📊 Portfolio Summary:`);
    console.log(`Total tokens found: ${tokens.length}`);
    
    if (tokens.length === 0) {
      console.log('ℹ️  No tokens found in wallet (empty wallet or invalid address)');
      return;
    }
    
    // Calculate totals
    let totalUsd = 0;
    let solBalance = 0;
    
    console.log('\n💰 Token Holdings:');
    tokens
      .filter(token => parseFloat(token.valueUsd || '0') > 0.01)
      .sort((a, b) => parseFloat(b.valueUsd || '0') - parseFloat(a.valueUsd || '0'))
      .slice(0, 10) // Top 10 tokens
      .forEach(token => {
        const balance = parseFloat(token.uiAmount || '0');
        const valueUsd = parseFloat(token.valueUsd || '0');
        const symbol = token.symbol || 'Unknown';
        const name = token.name || symbol;
        
        totalUsd += valueUsd;
        if (symbol === 'SOL') {
          solBalance = balance;
        }
        
        console.log(`  ${symbol.padEnd(8)} | ${balance.toFixed(4).padStart(12)} | $${valueUsd.toFixed(2).padStart(10)} | ${name}`);
      });
    
    console.log('');
    console.log(`💎 Portfolio Total: $${totalUsd.toFixed(2)}`);
    console.log(`⚡ SOL Balance: ${solBalance.toFixed(4)} SOL`);
    console.log('');
    console.log('✅ BirdEye API integration is working correctly!');
    console.log('🔧 The issue is that ElizaOS plugin routes are not being mounted.');
    console.log('📱 Your wallet data is ready to be displayed once the backend routes are fixed.');
    
  } catch (error) {
    console.log('❌ Error testing BirdEye API:', error.message);
  }
}

testBirdEyeAPI(); 