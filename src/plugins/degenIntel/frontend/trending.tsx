import { useQuery } from '@tanstack/react-query';
import Loader from './loader';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from './utils';

const formatCurrency = (value: number, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

export default function Trending() {
  const query = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      // Mock trending data structure for demonstration
      const mockData = [
        {
          id: "So11111111111111111111111111111111111111112",
          symbol: "SOL",
          name: "Solana",
          price: 185.32,
          priceChange24h: 12.5,
          volume24h: 1250000000,
          marketCap: 89500000000,
          rank: 1,
          chain: "solana",
          source: "birdeye"
        },
        {
          id: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          symbol: "USDC",
          name: "USD Coin",
          price: 1.00,
          priceChange24h: 0.02,
          volume24h: 850000000,
          marketCap: 45000000000,
          rank: 2,
          chain: "solana",
          source: "birdeye"
        },
        {
          id: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          symbol: "BONK",
          name: "Bonk",
          price: 0.00003421,
          priceChange24h: 18.9,
          volume24h: 145000000,
          marketCap: 2800000000,
          rank: 3,
          chain: "solana",
          source: "birdeye"
        }
      ];

      // Try to fetch from the backend first (in case it starts working)
      try {
        const response = await fetch('/trending', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
        }
      } catch (error) {
        console.log('Backend trending API not available, using mock data');
      }

      return mockData;
    },
    retry: 1,
    refetchInterval: 30000,
  });

  const logos = {
    ethereum: '/logos/ethereum.png',
    base: '/logos/base.jpeg',
    solana: '/logos/solana.png',
    birdeye: '/logos/birdeye.png',
    coinmarketcap: '/logos/coinmarketcap.png',
    L1: '/logos/l1.png',
  };

  if (query?.isPending) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Trending Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-100 rounded-lg">
            <Loader />
            <span className="ml-2 text-gray-700 font-medium">Loading trending tokens...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (query.isError) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Trending Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-gray-900">Configuration Required</h4>
            <p className="text-gray-700 mb-4">
              To display live trending data, ensure your .env file contains:
            </p>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-left font-mono text-sm">
              <code>
                BIRDEYE_API_KEY=your_birdeye_api_key<br/>
                COINMARKETCAP_API_KEY=your_cmc_api_key
              </code>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Configure market data APIs to start collecting trending token information.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure data is an array, provide fallback
  const trendingData = Array.isArray(query.data) ? query.data : [];

  if (trendingData.length === 0) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Trending Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-gray-800 font-medium">No trending tokens available.</p>
            <p className="text-sm text-gray-600 mt-2">Configure market data APIs to start collecting data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Trending Tokens</CardTitle>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 border-b border-gray-300">
                <TableHead className="w-12 text-gray-900 font-semibold">#</TableHead>
                <TableHead className="text-gray-900 font-semibold">Token</TableHead>
                <TableHead className="text-right text-gray-900 font-semibold">Price</TableHead>
                <TableHead className="text-right text-gray-900 font-semibold">24h Change</TableHead>
                <TableHead className="text-right text-gray-900 font-semibold">Volume (24h)</TableHead>
                <TableHead className="text-right text-gray-900 font-semibold">Market Cap</TableHead>
                <TableHead className="text-center text-gray-900 font-semibold">Chain</TableHead>
                <TableHead className="text-center text-gray-900 font-semibold">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trendingData.map((token, index) => (
                <TableRow key={token.id || index} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="font-bold text-gray-900">{token.rank || index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-bold text-gray-900">{token.name || token.symbol}</div>
                        <div className="text-sm text-gray-600 font-medium">{token.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-gray-800 font-semibold">
                    {token.price ? formatCurrency(token.price, 2, 6) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={token.priceChange24h >= 0 ? 'default' : 'destructive'} className="font-medium">
                      {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h?.toFixed(2) || '0'}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gray-800 font-medium">
                    {token.volume24h ? formatCurrency(token.volume24h, 0, 0) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right text-gray-800 font-medium">
                    {token.marketCap ? formatCurrency(token.marketCap, 0, 0) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <img 
                        src={logos[token.chain] || logos.solana} 
                        alt={token.chain} 
                        width={20} 
                        height={20} 
                        className="mx-auto rounded"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <img 
                        src={logos[token.source] || logos.birdeye} 
                        alt={token.source} 
                        width={20} 
                        height={20} 
                        className="mx-auto rounded"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
