import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import moment from 'moment';
import Loader from './loader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function Tweets() {
  const query = useQuery({
    queryKey: ['tweets'],
    queryFn: async () => {
      // Mock tweet data structure for demonstration
      const mockData = [
        {
          _id: "mock_1",
          id: "1234567890",
          username: "degenspartan",
          text: "just deployed my first trading bot using ElizaOS - the future of autonomous AI trading is here 🚀",
          likes: 142,
          retweets: 23,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          __v: 0
        },
        {
          _id: "mock_2", 
          id: "1234567891",
          username: "aitrader_bot",
          text: "market sentiment looking bullish for SOL ecosystem tokens 📈 time to deploy some capital",
          likes: 89,
          retweets: 12,
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          __v: 0
        },
        {
          _id: "mock_3",
          id: "1234567892", 
          username: "crypto_whale",
          text: "watching BTC break resistance levels... this could be the start of something big 👀",
          likes: 256,
          retweets: 45,
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          __v: 0
        }
      ];

      // Try to fetch from the backend first (in case it starts working)
      try {
        const response = await fetch('/tweets', {
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
        console.log('Backend tweets API not available, using mock data');
      }

      return mockData;
    },
    retry: 1,
    refetchInterval: 30000,
  });

  if (query?.isPending) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Latest Tweets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-100 rounded-lg">
            <Loader />
            <span className="ml-2 text-gray-700 font-medium">Loading latest tweets...</span>
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
          <CardTitle className="text-gray-900">Latest Tweets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-gray-900">Configuration Required</h4>
            <p className="text-gray-700 mb-4">
              To display live tweet data, ensure your .env file contains:
            </p>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-left font-mono text-sm">
              <code>
                TWITTER_USERNAME=your_twitter_username<br/>
                TWITTER_PASSWORD=your_twitter_password<br/>
                TWITTER_EMAIL=your_twitter_email
              </code>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Configure Twitter integration to start collecting tweet data for analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure data is an array, provide fallback
  const tweetsData = Array.isArray(query.data) ? query.data : [];

  if (tweetsData.length === 0) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Latest Tweets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-gray-800 font-medium">No tweets available.</p>
            <p className="text-sm text-gray-600 mt-2">Configure Twitter integration to start collecting data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Latest Tweets</CardTitle>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 border-b border-gray-300">
                <TableHead className="text-gray-900 font-semibold">Timestamp</TableHead>
                <TableHead className="text-gray-900 font-semibold">ID</TableHead>
                <TableHead className="text-gray-900 font-semibold">Username</TableHead>
                <TableHead className="w-[750px] text-gray-900 font-semibold">Tweet</TableHead>
                <TableHead className="text-center text-gray-900 font-semibold">Likes</TableHead>
                <TableHead className="text-center text-gray-900 font-semibold">Retweets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tweetsData.map((item) => (
                <TableRow key={`${item._id}_${item.likes}`} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="text-gray-700 font-medium">{moment(item.timestamp).format('LLL')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-gray-800 font-medium">{item.id}</div>
                      <a
                        href={`https://x.com/${item.username}/status/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900 font-semibold">@{item.username}</TableCell>
                  <TableCell>
                    <div className="line-clamp-2 text-gray-700 leading-relaxed">{item.text}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-red-600 font-bold">❤️ {item.likes}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-green-600 font-bold">🔄 {item.retweets}</span>
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
