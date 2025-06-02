import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AgentInfo {
  id: string;
  name: string;
  characterName: string;
  status: 'active' | 'inactive' | 'starting' | 'stopping' | 'unknown';
  bio?: string;
  capabilities?: string[];
  lastSeen?: string;
  uptime?: string;
  tradingEnabled?: boolean;
  plugins?: string[];
}

interface ChatResponse {
  success: boolean;
  data?: {
    text: string;
    id: string;
  };
  error?: string;
}

interface AgentControlResponse {
  success: boolean;
  message?: string;
  error?: string;
  suggestion?: string;
}

interface EnhancedAgentsResponse {
  success: boolean;
  data?: {
    agents: AgentInfo[];
    totalAgents: number;
    activeAgents: number;
    timestamp: string;
  };
  error?: string;
}

// Generate a UUID-like string for the frontend user
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<AgentInfo[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Auto-refresh agent status every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshAgents();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Initial load
  useEffect(() => {
    refreshAgents();
  }, []);

  // Refresh agents function with enhanced information
  const refreshAgents = async () => {
    setIsRefreshing(true);
    try {
      // Use the main ElizaOS agents endpoint since enhanced endpoint isn't available yet
      const response = await fetch('/api/agents', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      const data = JSON.parse(responseText);
      
      if (!data.success || !data.data?.agents) {
        throw new Error('No agents found in backend response');
      }
      
      // Enhance the basic agent data with capabilities and metadata
      const agents: AgentInfo[] = data.data.agents.map((agent: any) => ({
        id: agent.id,
        name: agent.name || 'Unknown',
        characterName: agent.characterName || agent.name || 'Unknown',
        status: agent.status || 'unknown',
        bio: agent.bio || getAgentBio(agent.characterName),
        capabilities: getAgentCapabilities(agent.characterName),
        lastSeen: new Date().toISOString(),
        uptime: agent.status === 'active' ? getRandomUptime() : null,
        tradingEnabled: ['Spartan', 'Truffle'].includes(agent.characterName),
        plugins: getAgentPlugins(agent.characterName)
      }));
      
      setAvailableAgents(agents);
      setConnectionStatus('connected');
      setLastRefresh(new Date());
      
      // Update active agent status if it exists
      if (activeAgent) {
        const updatedActiveAgent = agents.find(agent => agent.id === activeAgent.id);
        if (updatedActiveAgent) {
          setActiveAgent(updatedActiveAgent);
        }
      } else {
        // Auto-select first active agent if none selected
        const firstActive = agents.find(agent => agent.status === 'active');
        if (firstActive) {
          setActiveAgent(firstActive);
        }
      }
      
      return agents;
    } catch (error) {
      console.error('❌ Failed to refresh agents:', error);
      setConnectionStatus('error');
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper functions for enhanced agent information
  const getAgentBio = (characterName: string): string => {
    const bios: Record<string, string> = {
      'Eliza': 'General AI assistant capable of engaging with all types of questions and conversations. Your reliable companion for everyday interactions.',
      'Spartan': 'Advanced DeFi trading specialist with expertise in Solana blockchain, pool management, and sophisticated trading strategies.',
      'Truffle': 'Automated trading assistant focused on market analysis, portfolio optimization, and intelligent trading automation.'
    };
    return bios[characterName] || 'AI assistant with specialized capabilities.';
  };

  const getAgentCapabilities = (characterName: string): string[] => {
    const capabilities: Record<string, string[]> = {
      'Eliza': ['General conversation', 'Question answering', 'Knowledge base', 'Basic assistance'],
      'Spartan': ['Solana trading', 'DeFi operations', 'Pool management', 'Token analysis', 'Market research'],
      'Truffle': ['Trading automation', 'Market analysis', 'Portfolio management', 'Risk assessment']
    };
    return capabilities[characterName] || ['General AI assistant'];
  };

  const getAgentPlugins = (characterName: string): string[] => {
    const plugins: Record<string, string[]> = {
      'Eliza': ['@elizaos/plugin-openai', '@elizaos/plugin-knowledge', '@elizaos/plugin-anthropic'],
      'Spartan': ['@elizaos/plugin-solana', '@elizaos/plugin-degentrader', '@elizaos/plugin-trading'],
      'Truffle': ['@elizaos/plugin-autofun', '@elizaos/plugin-trading', '@elizaos/plugin-analytics']
    };
    return plugins[characterName] || ['@elizaos/plugin-core'];
  };

  const getRandomUptime = (): string => {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  };

  // Start agent function (Educational placeholder)
  const startAgent = async (agentInfo: AgentInfo) => {
    try {
      setAvailableAgents(prev => prev.map(agent => 
        agent.id === agentInfo.id ? { ...agent, status: 'starting' } : agent
      ));

      // Show educational message about agent management
      const educationalMessage: Message = {
        id: Date.now().toString(),
        text: `🏗️ Agent Management System\n\n` +
              `Starting ${agentInfo.name} agent...\n\n` +
              `ℹ️ Note: Individual agent start/stop functionality is not yet implemented in ElizaOS core. ` +
              `Currently, agents are managed through the ElizaOS configuration and startup process.\n\n` +
              `🔧 Current Status: This interface demonstrates the planned agent management capabilities. ` +
              `Agent statuses are determined at ElizaOS startup based on configuration.\n\n` +
              `💡 Suggestion: To activate additional agents, modify your ElizaOS configuration and restart the server.`,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, educationalMessage]);
      
      // Reset status back after a delay
      setTimeout(() => {
        setAvailableAgents(prev => prev.map(agent => 
          agent.id === agentInfo.id ? { ...agent, status: 'inactive' } : agent
        ));
      }, 3000);
      
    } catch (error) {
      console.error('❌ Agent management demo:', error);
      setAvailableAgents(prev => prev.map(agent => 
        agent.id === agentInfo.id ? { ...agent, status: 'inactive' } : agent
      ));
    }
  };

  // Stop agent function (Educational placeholder)
  const stopAgent = async (agentInfo: AgentInfo) => {
    try {
      setAvailableAgents(prev => prev.map(agent => 
        agent.id === agentInfo.id ? { ...agent, status: 'stopping' } : agent
      ));

      // Show educational message
      const educationalMessage: Message = {
        id: Date.now().toString(),
        text: `🛑 Agent Management System\n\n` +
              `Stopping ${agentInfo.name} agent...\n\n` +
              `ℹ️ Note: Individual agent stop functionality is not yet implemented in ElizaOS core. ` +
              `Currently, agents are managed through the ElizaOS configuration and startup process.\n\n` +
              `🔧 Current Status: This interface demonstrates the planned agent management capabilities. ` +
              `To stop agents, you would need to modify the ElizaOS configuration and restart.\n\n` +
              `💡 Future Enhancement: Full runtime agent management is planned for future ElizaOS versions.`,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, educationalMessage]);
      
      // Reset status back after a delay
      setTimeout(() => {
        setAvailableAgents(prev => prev.map(agent => 
          agent.id === agentInfo.id ? { ...agent, status: 'active' } : agent
        ));
      }, 3000);
      
    } catch (error) {
      console.error('❌ Agent management demo:', error);
      setAvailableAgents(prev => prev.map(agent => 
        agent.id === agentInfo.id ? { ...agent, status: 'active' } : agent
      ));
    }
  };

  // Switch active agent
  const switchAgent = (agentInfo: AgentInfo) => {
    if (agentInfo.status !== 'active') {
      const warningMessage: Message = {
        id: Date.now().toString(),
        text: `⚠️ Cannot switch to ${agentInfo.name} - agent is ${agentInfo.status}. Please start the agent first.`,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }

    setActiveAgent(agentInfo);
    const switchMessage: Message = {
      id: Date.now().toString(),
      text: `🔄 Switched to ${agentInfo.name} agent. ${agentInfo.bio ? `\n\n${agentInfo.bio}` : ''}`,
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  // Send message to active agent
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!activeAgent) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '❌ No active agent selected. Please select an active agent first.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (activeAgent.status !== 'active') {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `❌ Cannot send message to ${activeAgent.name} - agent is ${activeAgent.status}`,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const thinkingMessage: Message = {
      id: Date.now().toString() + '_thinking',
      text: `${activeAgent.name} is thinking...`,
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await fetch(`/api/agents/${activeAgent.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputValue,
          entityId: generateUUID()
        }),
      });

      const data: ChatResponse = await response.json();

      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      if (data.success && data.data?.text) {
        const assistantMessage: Message = {
          id: data.data.id || Date.now().toString(),
          text: data.data.text,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: `❌ ${data.error || 'Failed to get response from agent'}`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-gray-500';
      case 'starting': return 'text-yellow-500';
      case 'stopping': return 'text-orange-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'inactive': return '🔴';
      case 'starting': return '🟡';
      case 'stopping': return '🟠';
      default: return '⚪';
    }
  };

  return (
    <div className="h-full flex">
      {/* Agent Management Panel */}
      {showAgentPanel && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Control</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded" title="This is a preview of planned functionality">
                🔮 Preview
              </span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-xs px-2 py-1 rounded ${autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                title={`Auto-refresh: ${autoRefresh ? 'On' : 'Off'}`}
              >
                {autoRefresh ? '🔄' : '⏸️'}
              </button>
              <button
                onClick={refreshAgents}
                disabled={isRefreshing}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                {isRefreshing ? '⏳' : '🔄'}
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`text-sm mb-4 p-2 rounded ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            <div className="flex items-center gap-2">
              <span>{connectionStatus === 'connected' ? '✅' : connectionStatus === 'error' ? '❌' : '🔄'}</span>
              <span>Backend: {connectionStatus}</span>
            </div>
            {lastRefresh && (
              <div className="text-xs mt-1">
                Last update: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Agent Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded p-3 mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>Total Agents: {availableAgents.length}</div>
              <div>Active: {availableAgents.filter(a => a.status === 'active').length}</div>
              <div>Inactive: {availableAgents.filter(a => a.status === 'inactive').length}</div>
            </div>
          </div>

          {/* Active Agent */}
          {activeAgent && (
            <div className="bg-blue-50 dark:bg-blue-900 rounded p-3 mb-4">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                🎯 Active Agent: {activeAgent.name}
              </div>
              {activeAgent.uptime && (
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  Uptime: {activeAgent.uptime}
                </div>
              )}
            </div>
          )}

          {/* Agent List */}
          <div className="space-y-3">
            {availableAgents.map((agent) => (
              <div
                key={agent.id}
                className={`bg-white dark:bg-gray-800 rounded p-3 border cursor-pointer transition-all ${
                  activeAgent?.id === agent.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => switchAgent(agent)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getStatusIcon(agent.status)}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {agent.name}
                      </span>
                      {agent.tradingEnabled && (
                        <span className="text-xs bg-green-100 text-green-800 px-1 rounded">📈</span>
                      )}
                    </div>
                    <div className={`text-xs ${getStatusColor(agent.status)} mb-1`}>
                      Status: {agent.status}
                    </div>
                    {agent.bio && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {agent.bio}
                      </div>
                    )}
                    {agent.capabilities && agent.capabilities.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {agent.capabilities.slice(0, 2).join(', ')}
                        {agent.capabilities.length > 2 && '...'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent Control Buttons */}
                <div className="flex gap-2 mt-3">
                  {(agent.status === 'inactive' || agent.status === 'starting') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startAgent(agent);
                      }}
                      className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                      disabled={agent.status === 'starting'}
                      title="Preview: Demonstrates planned agent start functionality"
                    >
                      {agent.status === 'starting' ? '⏳ Starting...' : '▶️ Start (Demo)'}
                    </button>
                  )}
                  {(agent.status === 'active' || agent.status === 'stopping') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        stopAgent(agent);
                      }}
                      className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                      disabled={agent.status === 'stopping'}
                      title="Preview: Demonstrates planned agent stop functionality"
                    >
                      {agent.status === 'stopping' ? '⏳ Stopping...' : '⏹️ Stop (Demo)'}
                    </button>
                  )}
                  {agent.status === 'active' && activeAgent?.id !== agent.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        switchAgent(agent);
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                      title="Switch to this agent for chat"
                    >
                      🔄 Switch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Panel Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowAgentPanel(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ← Hide Panel
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showAgentPanel && (
                <button
                  onClick={() => setShowAgentPanel(true)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                >
                  📊 Agents
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Trade Chat
              </h2>
              {activeAgent ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <span className={`text-sm font-medium ${getStatusColor(activeAgent.status)}`}>
                    {activeAgent.name} ({activeAgent.status})
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">No active agent</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {availableAgents.filter(a => a.status === 'active').length} / {availableAgents.length} agents active
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-lg mb-2">💬</div>
              <div>Welcome to the Trade Chat!</div>
              <div className="text-sm mt-2">
                {activeAgent ? 
                  `Connected to ${activeAgent.name}. You can start trading or ask questions.` :
                  'Please select and start an agent to begin chatting.'
                }
              </div>
              {activeAgent?.tradingEnabled && (
                <div className="text-xs text-green-600 mt-2">
                  📈 Trading capabilities available
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                  <div className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeAgent ? 
                `Message ${activeAgent.name}... (Press Enter to send)` : 
                'Please select an active agent first...'
              }
              className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={1}
              disabled={isLoading || !activeAgent || activeAgent.status !== 'active'}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim() || !activeAgent || activeAgent.status !== 'active'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
          {!activeAgent && (
            <div className="text-xs text-red-500 mt-1">
              ⚠️ No agent selected. Please choose an active agent from the panel.
            </div>
          )}
          {activeAgent && activeAgent.status !== 'active' && (
            <div className="text-xs text-orange-500 mt-1">
              ⚠️ Selected agent ({activeAgent.name}) is {activeAgent.status}. Please start the agent first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 