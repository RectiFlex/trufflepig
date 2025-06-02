# TrufflePig Trading Bot - Quick Start Guide

This guide explains how to run your TrufflePig trading bot efficiently with a single command.

## 🚀 Quick Start

### Start Everything (Recommended)
```bash
npm run start:trading-bot
```
This single command will:
- ✅ Clean up any existing processes
- ✅ Check prerequisites (npm, database, env files)
- ✅ Install/update dependencies
- ✅ Setup database (apply migrations if needed)
- ✅ Start ElizaOS backend with SSL bypass
- ✅ Start frontend interface
- ✅ Test agent connectivity
- ✅ Monitor services with health checks

### Alternative: Direct Script
```bash
./start-trading-bot.sh
```

## 🛠️ Management Commands

### Check Status
```bash
npm run status:trading-bot
```
Shows which services are running.

### Stop All Services
```bash
npm run stop:trading-bot
```
Safely stops all backend and frontend processes.

### Restart Everything
```bash
npm run restart:trading-bot
```
Stops and restarts all services.

### View Logs
```bash
npm run logs:trading-bot
```
Shows recent backend and frontend logs.

## 🌐 Access Points

Once running, you can access:

- **Frontend Dashboard**: http://localhost:5173/degen-intel/
- **Backend API**: http://localhost:3000
- **Agent Chat**: Go to frontend and click "💬 Trade Chat" tab

## 📊 Monitoring

The startup script provides real-time monitoring:
- ✅ **Green**: Service is healthy
- ⚠️ **Yellow**: Warning or minor issue  
- ❌ **Red**: Error or service down

### Log Files
- `backend.log` - ElizaOS backend logs
- `frontend.log` - Frontend development server logs

## 🔧 Troubleshooting

### Common Issues

**Database Issues:**
- The script automatically applies migrations if needed
- Check PostgreSQL is running: `brew services start postgresql`

**Port Conflicts:**
- The script automatically kills conflicting processes
- Backend runs on port 3000
- Frontend runs on port 5173

**SSL Certificate Errors:**
- Script automatically sets `NODE_TLS_REJECT_UNAUTHORIZED=0`
- This bypasses SSL issues with Anthropic API

**Agent Not Responding:**
- Check agent status in the frontend
- Only Eliza agent may be active initially
- Spartan and Truffle agents may need manual activation

### Manual Debugging

View live logs:
```bash
# Backend logs
tail -f backend.log

# Frontend logs  
tail -f frontend.log
```

Check specific processes:
```bash
# See what's running
ps aux | grep -E "(elizaos|vite)"

# Check ports
lsof -i :3000,5173
```

## 🎯 Agent Details

Your trading bot includes these agents:

1. **Eliza** - Main conversational agent (Usually active)
2. **Spartan** - Solana trading specialist (May need activation)
3. **Truffle** - Advanced trading automation (May need activation)

Check agent status in the Trade Chat interface for real-time information.

## ⚡ Pro Tips

1. **Always use the startup script** - It handles all the complex setup automatically
2. **Monitor the logs** - They provide valuable debugging information
3. **Use Ctrl+C** to stop - The script handles graceful shutdown
4. **Check agent status** regularly in the frontend interface
5. **Restart if issues persist** - `npm run restart:trading-bot`

## 🆘 Need Help?

If you encounter issues:

1. Check the log files (`backend.log`, `frontend.log`)
2. Try restarting: `npm run restart:trading-bot`
3. Check service status: `npm run status:trading-bot`
4. Ensure PostgreSQL is running
5. Verify your `.env` file has the correct API keys

---

**Happy Trading! 🚀📈** 