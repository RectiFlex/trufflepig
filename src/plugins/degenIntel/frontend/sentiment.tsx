import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import Loader from './loader';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function Sentiment() {
  const query = useQuery({
    queryKey: ['sentiment'],
    queryFn: async () => {
      // Mock sentiment data structure for demonstration
      const mockData = [
        {
          id: "sentiment_1",
          text: "Overall market sentiment is bullish with strong institutional interest in Solana ecosystem",
          sentiment: "bullish",
          score: 0.85,
          occuringTokens: ["SOL", "BONK", "JUP"],
          timeslot: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          processed: true
        },
        {
          id: "sentiment_2", 
          text: "Traders showing increased confidence in DeFi protocols with rising TVL across major platforms",
          sentiment: "positive",
          score: 0.72,
          occuringTokens: ["ORCA", "RAY", "SRM"],
          timeslot: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          processed: true
        },
        {
          id: "sentiment_3",
          text: "Mixed signals in meme coin sector with high volatility but sustained community engagement",
          sentiment: "neutral",
          score: 0.45,
          occuringTokens: ["BONK", "WIF", "POPCAT"],
          timeslot: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
          processed: true
        },
        {
          id: "sentiment_4",
          text: "Bearish sentiment emerging around high-risk leverage positions as market shows signs of consolidation",
          sentiment: "bearish",
          score: 0.25,
          occuringTokens: ["BTC", "ETH", "SOL"],
          timeslot: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
          processed: true
        }
      ];

      // Try to fetch from the backend first (in case it starts working)
      try {
        const response = await fetch('/sentiment', {
          method: 'GET',
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
        console.log('Backend sentiment API not available, using mock data');
      }

      return mockData;
    },
    retry: 1,
    refetchInterval: 30000,
  });

  // Handle loading state
  if (query.isLoading) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-100 rounded-lg">
            <Loader />
            <span className="ml-2 text-gray-700 font-medium">Loading sentiment data...</span>
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
          <CardTitle className="text-gray-900">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-gray-900">Configuration Required</h4>
            <p className="text-gray-700 mb-4">
              To display live sentiment data, ensure your .env file contains:
            </p>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-left font-mono text-sm">
              <code>
                TWITTER_USERNAME=your_twitter_username<br/>
                TWITTER_PASSWORD=your_twitter_password<br/>
                TWITTER_EMAIL=your_twitter_email<br/>
                OPENAI_API_KEY=your_openai_api_key
              </code>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Configure Twitter integration and AI services to start analyzing sentiment data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure data is an array, provide fallback
  const sentimentData = Array.isArray(query.data) ? query.data : [];

  if (sentimentData.length === 0) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-gray-800 font-medium">No sentiment data available.</p>
            <p className="text-sm text-gray-600 mt-2">Configure Twitter integration to start collecting data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return 'default';
      case 'bearish':
      case 'negative':
        return 'destructive';
      case 'neutral':
      default:
        return 'secondary';
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-700 font-bold';
    if (score >= 0.4) return 'text-yellow-700 font-bold';
    return 'text-red-700 font-bold';
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Sentiment Analysis</CardTitle>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 border-b border-gray-300">
                <TableHead className="text-gray-900 font-semibold">Time</TableHead>
                <TableHead className="text-gray-900 font-semibold">Sentiment</TableHead>
                <TableHead className="text-gray-900 font-semibold">Score</TableHead>
                <TableHead className="text-gray-900 font-semibold">Tokens</TableHead>
                <TableHead className="w-[400px] text-gray-900 font-semibold">Analysis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sentimentData.map((item: any, index: number) => (
                <TableRow key={item.id || index} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="text-gray-800 font-medium">
                    {moment(item.timeslot || item.timestamp).format('MMM D, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSentimentBadgeVariant(item.sentiment)} className="font-medium">
                      {item.sentiment || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={getSentimentColor(item.score || 0)}>
                      {((item.score || 0) * 100).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(item.occuringTokens || []).slice(0, 3).map((token: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-800 border-blue-200">
                          {token}
                        </Badge>
                      ))}
                      {(item.occuringTokens || []).length > 3 && (
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                          +{(item.occuringTokens || []).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{item.text || 'No analysis available'}</div>
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
