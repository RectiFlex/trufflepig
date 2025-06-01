#!/bin/bash

# Set environment variables to bypass SSL certificate issues
export NODE_TLS_REJECT_UNAUTHORIZED=0

echo "==============================================="
echo "🚀 Starting Spartan Trading Bot (Production)"
echo "==============================================="
echo "📁 Loading configuration from .env file..."
echo "🔐 SSL certificate validation: DISABLED"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found - configuration will be loaded automatically"
    echo ""
    echo "📋 Checking key environment variables from .env:"
    
    # Source .env to check variables (without affecting the running environment)
    source .env 2>/dev/null || echo "⚠️  Could not source .env file for checking"
    
    if [ ! -z "$SOLANA_RPC_URL" ]; then
        echo "✅ SOLANA_RPC_URL: Configured"
    else
        echo "❌ SOLANA_RPC_URL: Not found in .env"
    fi
    
    if [ ! -z "$SOLANA_PRIVATE_KEY" ]; then
        echo "✅ SOLANA_PRIVATE_KEY: Configured"
    else
        echo "❌ SOLANA_PRIVATE_KEY: Not found in .env"
    fi
    
    if [ ! -z "$OPENAI_API_KEY" ] || [ ! -z "$ANTHROPIC_API_KEY" ] || [ ! -z "$GROQ_API_KEY" ]; then
        echo "✅ AI API Keys: At least one configured"
    else
        echo "⚠️  AI API Keys: None found (will use local AI)"
    fi
    
else
    echo "❌ .env file not found!"
    echo "   Please create a .env file with your configuration"
    echo "   Required variables: SOLANA_RPC_URL, SOLANA_PRIVATE_KEY"
fi

echo ""
echo "🏗️  Building and starting production server..."
echo "==============================================="

# Build and start the production server (dotenv will automatically load .env)
yarn build && yarn start 